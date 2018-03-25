Courtier = class Courtier extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to reveal:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Courtier.reveal_card)
    } else if (_.size(player_cards.hand) === 1) {
      Courtier.reveal_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in hand`)
    }
  }

  static reveal_card(game, player_cards, selected_card) {
    revealed_card = selected_card[0]
    card_types_count = _.size(_.words(revealed_card.types))

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose ${card_types_count}:`,
      minimum: card_types_count,
      maximum: card_types_count,
      options: [
        {text: '+1 Action', value: 'action'},
        {text: '+1 Buy', value: 'buy'},
        {text: 'Gain a Gold', value: 'gold'},
        {text: '+$3', value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Courtier.process_choice)
  }

  static process_choice(game, player_cards, choices) {
    _.each(choices, (choice) => {
      if (choice === 'action') {
        game.turn.actions += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
      } else if (choice === 'buy') {
        game.turn.buys += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
      } else if (choice === 'gold') {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
        card_gainer.gain_game_card()
      } else if (choice === 'coin') {
        let gained_coins = CoinGainer.gain(game, player_cards, 3)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
      }
    })
  }

}
