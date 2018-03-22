Mill = class Mill extends Card {

  types() {
    return ['victory', 'action']
  }

  coin_cost() {
    return 4
  }

  victory_points() {
    return 1
  }

  play(game, player_cards) {
  }

}
