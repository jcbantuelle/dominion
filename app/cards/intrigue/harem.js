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
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

}
