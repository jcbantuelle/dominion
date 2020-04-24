LuckyCoin = class LuckyCoin extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
