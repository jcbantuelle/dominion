Pawn = class Pawn extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose Two:`,
      minimum: 2,
      maximum: 2,
      options: [
        {text: '+1 card', value: 'card'},
        {text: '+1 action', value: 'action'},
        {text: '+1 buy', value: 'buy'},
        {text: '+$1', value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Pawn.process_choices)
  }

  static process_choices(game, player_cards, choices) {
    let gained = []
    _.each(choices, function(choice) {
      if (choice === 'card') {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(1)
      } else if (choice === 'action') {
        game.turn.actions += 1
        gained.push('+1 action')
      } else if (choice === 'buy') {
        game.turn.buys += 1
        gained.push('+1 buy')
      } else if (choice === 'coin') {
        let gained_coins = CoinGainer.gain(game, player_cards, 1)
        gained.push(`+$${gained_coins}`)
      }
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gained.join(' and ')}`)
  }

}
