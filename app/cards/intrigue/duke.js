Duke = class Duke extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 5
  }

  victory_points(player_cards) {
    return this.point_variable(player_cards)
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return card.name === 'Duchy'
    }))
  }
}
