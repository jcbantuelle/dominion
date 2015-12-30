Hireling = class Hireling extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    player_cards.permanent_duration_effects.push(this.to_h())

    return 'permanent'
  }

  duration(game, player_cards, duration_card) {
    let card_drawer = new CardDrawer(game, player_cards)
    let drawn_count = card_drawer.draw(1, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws ${drawn_count} card(s) from ${CardView.render(duration_card)}`)
  }

}
