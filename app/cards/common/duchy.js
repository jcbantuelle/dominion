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

  // gain_event(gainer) {
  //   let turn_event_id = TurnEventModel.insert({
  //     game_id: gainer.game._id,
  //     player_id: gainer.player_cards.player_id,
  //     username: gainer.player_cards.username,
  //     type: 'choose_yes_no',
  //     instructions: `Gain a ${CardView.render(new Duchess())}?`,
  //     minimum: 1,
  //     maximum: 1
  //   })
  //   let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
  //   turn_event_processor.process(Duchy.gain_duchess)
  // }

  // static gain_duchess(game, player_cards, response) {
  //   if (response === 'yes') {
  //     let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchess')
  //     card_gainer.gain()
  //   }
  // }

}
