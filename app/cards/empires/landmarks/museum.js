Museum = class Museum extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * 2
  }

  point_variable(player_cards, game) {
    return _.size(_.groupBy(player_cards, function(card) {
      return card.name
    }))
  }

}
