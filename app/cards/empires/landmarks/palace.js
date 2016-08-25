Palace = class Palace extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * 3
  }

  point_variable(player_cards, game) {
    let grouped_cards = _.groupBy(player_cards, function(card) {
      return card.name
    })
    let coppers = _.size(grouped_cards['Copper'])
    let silvers = _.size(grouped_cards['Silver'])
    let golds = _.size(grouped_cards['Gold'])
    return Math.min(coppers, silvers, golds)
  }

}
