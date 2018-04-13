DenOfSin = class DenOfSin extends Card {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    let card_drawer = new CardDrawer(game, player_cards)
    let drawn_count = card_drawer.draw(2, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${drawn_count} card(s) from ${CardView.render(this)}`)
  }

  destination() {
    return 'hand'
  }

}
