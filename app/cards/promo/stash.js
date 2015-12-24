Stash = class Stash extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)
  }

}
