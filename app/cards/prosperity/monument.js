Monument = class Monument extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)
  }

}
