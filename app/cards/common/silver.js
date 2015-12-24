Silver = class Silver extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)
  }

}
