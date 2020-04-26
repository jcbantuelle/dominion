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
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(gained_coin, false)
  }

}
