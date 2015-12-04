SilkRoad = class SilkRoad extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 4
  }

  victory_points(player_cards) {
    return Math.floor(this.point_variable(player_cards) / 4)
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return _.contains(_.words(card.types), 'victory')
    }))
  }

}
