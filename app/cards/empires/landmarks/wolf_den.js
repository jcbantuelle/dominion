WolfDen = class WolfDen extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * -3
  }

  point_variable(player_cards, game) {
    let grouped_cards = _.groupBy(player_cards, function(card) {
      return card.name
    })
    return _.size(_.filter(grouped_cards, function(card_group) {
      return _.size(card_group) === 1
    }))
  }

}
