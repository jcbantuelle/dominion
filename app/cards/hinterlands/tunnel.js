Tunnel = class Tunnel extends Card {

  types() {
    return ['victory', 'reaction']
  }

  coin_cost() {
    return 3
  }

  victory_points() {
    return 2
  }

  discard_event(discarder, tunnel) {
    let turn_event_id = TurnEventModel.insert({
      game_id: discarder.game._id,
      player_id: discarder.player_cards.player_id,
      username: discarder.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Reveal ${CardView.render(tunnel)} to gain a ${CardView.render(new Gold())}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, tunnel)
    turn_event_processor.process(Tunnel.gain_gold)
  }

  static gain_gold(game, player_cards, response, tunnel) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(tunnel)}`)
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain_game_card()
    }
  }

}
