Guide = class Guide extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    this.move_to_tavern(game, player_cards, player.played_card)
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
      let reserve_index = _.findIndex(player_cards.tavern, function(card) {
        return card.id === guide.id
      })
      let reserve = player_cards.tavern.splice(reserve_index, 1)[0]
      game.log.push(`<strong>${player_cards.username}</strong> calls ${CardView.render(reserve)}`)
      player_cards.in_play.push(reserve)

      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(5, false)
    }
  }

}
