Festival = class Festival extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)
  }

}
