Pasture = class Pasture extends Card {

  types() {
    return ['treasure', 'victory', 'heirloom']
  }

  coin_cost() {
    return 2
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
      return card.name === 'Estate'
    }))
  }

}
