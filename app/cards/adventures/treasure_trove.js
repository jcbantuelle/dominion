TreasureTrove = class TreasureTrove extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2, false)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()

    card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
    card_gainer.gain()
  }

}
