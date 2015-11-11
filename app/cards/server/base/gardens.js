Gardens = class Gardens extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 4
  }

  victory_points(player_cards) {
    return Math.floor(this.point_variable(player_cards) / 10)
  }

  point_variable(player_cards) {
    return _.size(player_cards)
  }

}
