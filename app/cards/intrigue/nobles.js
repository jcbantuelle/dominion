Nobles = class Nobles extends Card {

  types() {
    return ['action', 'victory']
  }

  coin_cost() {
    return 6
  }

  victory_points() {
    return 2
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
        {text: '+3 cards', value: 'cards'},
        {text: '+2 actions', value: 'actions'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Nobles.process_response)
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)
    } else if (response[0] === 'actions') {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(2)
    }
  }

}
