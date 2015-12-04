Squire = class Squire extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1`)

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
    choice = choice[0]
    if (choice === 'actions') {
      game.turn.actions += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
    } else if (choice === 'buys') {
      game.turn.buys += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 buys`)
    } else if (choice === 'silver') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    }
  }

  trash_event(trasher) {
    let eligible_cards = _.filter(trasher.game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && _.contains(_.words(card.top_card.types), 'attack')
    })

    if (_.size(eligible_cards) > 0) {
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
    } else {
      trasher.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
