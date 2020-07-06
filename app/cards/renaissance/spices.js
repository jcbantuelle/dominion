Spices = class Spices extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2, false)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

  gain_event(gainer, spices) {
    let coffer_gainer = new CofferGainer(gainer.game, gainer.player_cards, spices)
    coffer_gainer.gain(2)
  }

}
