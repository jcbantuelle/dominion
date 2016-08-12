BanditFort = class BanditFort extends Landmark {

  victory_points(player_cards) {
    return this.point_variable(player_cards) * -2
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return _.includes(['Silver', 'Gold'], card.name)
    }))
  }

}
