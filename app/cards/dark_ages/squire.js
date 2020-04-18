Squire = class Squire extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    GameModel.update(game._id, game)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+2 actions', value: 'actions'},
        {text: '+2 buys', value: 'buys'},
        {text: 'Gain a silver', value: 'silver'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Squire.process_choice)
  }

  static process_choice(game, player_cards, choice) {
    if (choice[0] === 'actions') {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(2)
    } else if (choice[0] === 'buys') {
      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(2)
    } else if (choice[0] === 'silver') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    }
  }

  trash_event(trasher) {
    let eligible_cards = _.filter(trasher.game.cards, function(card) {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'attack')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: trasher.game._id,
        player_id: trasher.player_cards.player_id,
        username: trasher.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(trasher.game, trasher.player_cards, turn_event_id)
      turn_event_processor.process(Squire.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Squire.gain_card(trasher.game, trasher.player_cards, eligible_cards)
    } else {
      trasher.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
