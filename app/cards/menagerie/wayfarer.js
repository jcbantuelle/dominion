Wayfarer = class Wayfarer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Gain a ${CardView.render(new Silver())}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let choice = turn_event_processor.process(Wayfarer.gain_silver)

    if (choice === 'yes') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to gain a ${CardView.render(new Silver())}`)
    }
  }

  static gain_silver(game, player_cards, response) {
    return response
  }

}
