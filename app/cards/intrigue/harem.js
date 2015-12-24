Harem = class Harem extends Card {

  types() {
    return ['victory', 'treasure']
  }

  coin_cost() {
    return 6
  }

  victory_points() {
    return 2
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)
  }

}
