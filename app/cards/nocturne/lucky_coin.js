LuckyCoin = class LuckyCoin extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain_game_card()
  }

}
