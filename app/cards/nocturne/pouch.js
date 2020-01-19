Pouch = class Pouch extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
    game.turn.buys += 1
  }

}
