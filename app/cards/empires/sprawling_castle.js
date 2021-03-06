SprawlingCastle = class SprawlingCastle extends Castles {

  coin_cost() {
    return 8
  }

  victory_points(player_cards) {
    return 4
  }

  gain_event(gainer) {
    let turn_event_id = TurnEventModel.insert({
      game_id: gainer.game._id,
      player_id: gainer.player_cards.player_id,
      username: gainer.player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: `Gain a ${CardView.render(new Duchy())}`, value: 'duchy'},
        {text: `Gain 3 ${CardView.render(new Estate(gainer.game))}`, value: 'estate'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
    turn_event_processor.process(SprawlingCastle.process_response)
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'duchy') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchy')
      card_gainer.gain()
    } else if (response[0] === 'estate') {
      _.times(3, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
        card_gainer.gain()
      })
    }
  }

}
