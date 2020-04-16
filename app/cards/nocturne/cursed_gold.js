CursedGold = class CursedGold extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 3)
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Curse')
    card_gainer.gain()
  }

}
