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

  discard_reaction(game, player_cards) {
    if (game.turn.phase !== 'cleanup') {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(this)} to gain a ${CardView.card_html('treasure', 'Gold')}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Tunnel.gain_gold)
    }
  }

  static gain_gold(game, player_cards, response) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.card_html('victory reaction', 'Tunnel')}`)
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain_game_card()
    }
  }

}
