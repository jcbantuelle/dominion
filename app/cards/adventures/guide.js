Guide = class Guide extends Reserve {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  reserve(game, player_cards, guide) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(guide)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, guide)
    turn_event_processor.process(Guide.call_card)
  }

  static call_card(game, player_cards, response, guide) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, guide)

      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(5)
    }
  }

}
