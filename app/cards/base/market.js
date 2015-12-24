Market = class Market extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action, +1 buy, and +$${gained_coins}`)
  }

}
