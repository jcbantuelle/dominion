CandlestickMaker = class CandlestickMaker extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coffer_gainer = new CofferGainer(game, player_cards)
    coffer_gainer.gain(1)
  }

}
