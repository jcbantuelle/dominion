Princess = class Princess extends Card {

  types() {
    return ['action', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

}
