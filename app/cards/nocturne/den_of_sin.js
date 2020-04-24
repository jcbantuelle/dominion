DenOfSin = class DenOfSin extends Duration {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, den_of_sin) {
    let card_drawer = new CardDrawer(game, player_cards, den_of_sin)
    let drawn_count = card_drawer.draw(2)
  }

  destination() {
    return 'hand'
  }

}
