Hireling = class Hireling extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, hireling) {
    let card_drawer = new CardDrawer(game, player_cards, hireling)
    let drawn_count = card_drawer.draw(1)
    player_cards.duration_effects.push(hireling)
  }

}
