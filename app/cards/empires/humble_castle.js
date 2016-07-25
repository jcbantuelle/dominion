HumbleCastle = class HumbleCastle extends Castles {

  types() {
    return ['treasure', 'victory', 'castle']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
  }

  victory_points(player_cards) {
    return this.point_variable(player_cards)
  }

  point_variable(player_cards) {
    return _.size(_.filter(player_cards, function(card) {
      return _.includes(_.words(card.types), 'castle')
    }))
  }

}
