Plunder = class Plunder extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  stack_name() {
    return 'Encampment/Plunder'
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2, false)

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)
  }

}
