Fairgrounds = class Fairgrounds extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 6
  }

  victory_points(player_cards) {
    return Math.floor(this.point_variable(player_cards) / 5) * 2
  }

  point_variable(player_cards) {
    let unique_cards = _.uniqBy(player_cards, 'name')
    return _.size(unique_cards)
  }

}
