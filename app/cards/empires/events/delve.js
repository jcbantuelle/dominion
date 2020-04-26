Delve = class Delve extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
