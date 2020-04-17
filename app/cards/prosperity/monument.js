Monument = class Monument extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)
  }

}
