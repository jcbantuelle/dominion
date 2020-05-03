GrandMarket = class GrandMarket extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)
  }

}
