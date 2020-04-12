Diadem = class Diadem extends Card {

  types() {
    return ['treasure', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2 + game.turn.actions)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
