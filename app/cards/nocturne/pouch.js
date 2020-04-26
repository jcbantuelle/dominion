Pouch = class Pouch extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

}
