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
    let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id, {discarder: discarder, tunnel: tunnel})
    turn_event_processor.process(Tunnel.gain_gold)
  }

  static gain_gold(game, player_cards, response, params) {
    if (response === 'yes') {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal(params.discarder.source, params.tunnel)

      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain()
    }
  }

}
