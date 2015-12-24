Platinum = class Platinum extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 9
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 5)
  }

}
