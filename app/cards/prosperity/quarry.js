Quarry = class Quarry extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
  }

}
