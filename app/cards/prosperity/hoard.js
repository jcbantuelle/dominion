Hoard = class Hoard extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2, false)
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

}
