TriumphalArch = class TriumphalArch extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * 3
  }

  point_variable(player_cards, game) {
    let sorted_cards = _.chain(player_cards).filter(function(card) {
      return _.includes(_.words(card.types), 'action')
    }).groupBy(function(card) {
      return card.name
    }).sortBy(function(card_group) {
      return -_.size(card_group)
    }).value()
    return _.size(sorted_cards[1])
  }

}
