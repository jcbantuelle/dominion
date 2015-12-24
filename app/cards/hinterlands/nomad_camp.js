NomadCamp = class NomadCamp extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)
  }

  destination() {
    return 'deck'
  }

}
