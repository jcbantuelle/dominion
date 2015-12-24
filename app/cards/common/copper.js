Copper = class Copper extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1 + game.turn.coppersmiths)
  }

}
