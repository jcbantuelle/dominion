HumbleCastle = class HumbleCastle extends Castles {

  types() {
    return ['treasure', 'victory', 'castle']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
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
