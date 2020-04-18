RuinedMarket = class RuinedMarket extends Ruins {

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

}
