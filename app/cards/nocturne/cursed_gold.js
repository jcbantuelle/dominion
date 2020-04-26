CursedGold = class CursedGold extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3, false)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    card_gainer.gain()
  }

}
