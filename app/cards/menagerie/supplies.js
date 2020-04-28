Supplies = class Supplies extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Horse')
    card_gainer.gain()
  }

}
