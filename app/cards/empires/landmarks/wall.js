Wall = class Wall extends Landmark {

  victory_points(player_cards) {
    return this.point_variable(player_cards) * -1
  }

  point_variable(player_cards) {
    return Math.max(0, _.size(player_cards) - 15)
  }

}
