Fountain = class Fountain extends Landmark {

  victory_points(player_cards) {
    return this.point_variable(player_cards) >= 10 ? 15 : 0
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return card.name === 'Copper'
    }))
  }

}
