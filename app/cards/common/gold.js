Gold = class Gold extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 3)
  }

}
