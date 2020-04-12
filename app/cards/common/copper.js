Copper = class Copper extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1 + game.turn.coppersmiths, false)
  }

}
