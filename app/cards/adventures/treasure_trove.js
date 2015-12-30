TreasureTrove = class TreasureTrove extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()

    card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
    card_gainer.gain_game_card()
  }

}
