HuntingGrounds = class HuntingGrounds extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(4)
  }

  trash_event(trasher) {
    GameModel.update(trasher.game._id, trasher.game)
    let turn_event_id = TurnEventModel.insert({
      game_id: trasher.game._id,
      player_id: trasher.player_cards.player_id,
      username: trasher.player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: `Gain a ${CardView.render(new Duchy())}`, value: 'duchy'},
        {text: `Gain 3 ${CardView.render(new Estate(trasher.game))}`, value: 'estate'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(trasher.game, trasher.player_cards, turn_event_id)
    turn_event_processor.process(HuntingGrounds.process_response)
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
