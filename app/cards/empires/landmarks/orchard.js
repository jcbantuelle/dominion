Orchard = class Orchard extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * 4
  }

  point_variable(player_cards, game) {
    let grouped_cards = _.groupBy(player_cards, function(card) {
      return card.name
    })
    return _.size(_.filter(grouped_cards, function(card_group) {
      return _.size(card_group) >= 3 && _.includes(_.words(card_group[0].types), 'action')
    }))
  }

}
