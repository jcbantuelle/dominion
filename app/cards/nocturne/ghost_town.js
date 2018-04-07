GhostTown = class GhostTown extends Card {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1, false)
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 card and +1 action from ${CardView.render(this)}`)
  }

  destination() {
    return 'hand'
  }

}
