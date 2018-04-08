Gold = class Gold extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let gained_coin = 3
    if (game.turn.envious) {
      gained_coin = 1
    }
    CoinGainer.gain(game, player_cards, gained_coin)
  }

}
