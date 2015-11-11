Duchy = class Duchy extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 5
  }

  victory_points() {
    return 3
  }

  gain_event(gainer) {
    if (gainer.game.duchess) {
      let player_cards = PlayerCards.findOne({
        username: gainer.username,
        game_id: gainer.game._id
      })
      let turn_event_id = TurnEvents.insert({
        game_id: gainer.game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Gain a ${CardView.card_html('action', 'Duchess')}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, player_cards, turn_event_id)
      turn_event_processor.process(Duchy.gain_duchess)
    }
  }

  static gain_duchess(game, player_cards, response) {
    if (response === 'yes') {
      let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, 'Duchess')
      card_gainer.gain_game_card()
    }
  }

}
