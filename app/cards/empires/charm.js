Charm = class Charm extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$2 and +1 buy', value: 'coin'},
        {text: 'Gain a card on next buy', value: 'gain'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Charm.process_response)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'coin') {
      game.turn.buys += 1
      let gained_coins = CoinGainer.gain(game, player_cards, 2)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses +1 buy and +$${gained_coins}`)
    } else if (response === 'gain') {
      game.turn.charms += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to gain a card on next buy`)
    }
  }

}
