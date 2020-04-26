Talisman = class Talisman extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', buyer.card.name)
    card_gainer.gain()
  }

}
