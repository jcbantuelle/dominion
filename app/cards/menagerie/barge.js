Barge = class Barge extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose When to Receive +3 Cards & +1 Buy:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Now', value: 'now'},
        {text: 'Next Turn', value: 'next_turn'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let response = turn_event_processor.process(Barge.process_response)

    if (response === 'now') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)

      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(1)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to take the effect next turn`)
      player_cards.duration_effects.push(_.clone(card_player.card))
      return 'duration'
    }
  }

  duration(game, player_cards, barge) {
    let card_drawer = new CardDrawer(game, player_cards, barge)
    card_drawer.draw(3)

    let buy_gainer = new BuyGainer(game, player_cards, barge)
    buy_gainer.gain(1)
  }

  static process_response(game, player_cards, response) {
    return response[0]
  }

}
