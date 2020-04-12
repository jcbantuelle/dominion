Platinum = class Platinum extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 9
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(5, false)
  }

}
