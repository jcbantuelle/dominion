WayOfTheTurtle = class WayOfTheTurtle extends Way {

  play(game, player_cards, card_player) {
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.aside, card_player.card)) {
      let way_of_the_turtle = this.to_h()
      way_of_the_turtle.target = card_player.card
      player_cards.start_turn_event_effects.push(way_of_the_turtle)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(card_player.card)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;but is unable to set aside ${CardView.render(card_player.card)}`)
    }
  }

  start_turn_event(game, player_cards, way_of_the_turtle) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(way_of_the_turtle)}`)
    let card_player = new CardPlayer(game, player_cards, way_of_the_turtle.target)
    card_player.play(true, true, 'aside')
  }

}
