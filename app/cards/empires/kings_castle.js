KingsCastle = class KingsCastle extends Castles {

  coin_cost() {
    return 10
  }

  victory_points(player_cards) {
    return this.point_variable(player_cards) * 2
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return _.includes(_.words(card.types), 'castle')
    }))
  }

}
