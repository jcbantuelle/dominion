Vineyard = class Vineyard extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 0
  }

  potion_cost() {
    return 1
  }

  victory_points(player_cards) {
    return Math.floor(this.point_variable(player_cards) / 3)
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return _.contains(_.words(card.types), 'action')
    }))
  }

}
