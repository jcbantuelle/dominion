PlayerScoreCalculator = class PlayerScoreCalculator {

  constructor(player_cards) {
    this.player_cards = player_cards
    this.card_sources = ['hand', 'discard', 'deck', 'playing', 'in_play', 'revealed', 'duration', 'haven', 'native_village', 'island']
  }

  calculate() {
    return _.reduce(this.card_sources, this.add_points_from_source.bind(this), 0) + this.player_cards.victory_tokens
  }

  add_points_from_source(points, source) {
    return points + _.reduce(this.player_cards[source], this.add_card_points.bind(this), 0)
  }

  add_card_points(points, card) {
    return points + this.card_points(card)
  }

  card_points(card) {
    let point_card = ClassCreator.create(card.name)
    return point_card.victory_points(this.player_cards)
  }

}
