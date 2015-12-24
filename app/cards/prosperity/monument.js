Monument = class Monument extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)
    player_cards.victory_tokens += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} and +1 &nabla;`)
  }

}
