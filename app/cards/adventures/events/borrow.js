Borrow = class Borrow extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    if (!player_cards.tokens.minus_card) {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes their -1 card token and gets +$${gained_coins}`)
      player_cards.tokens.minus_card = true
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has their -1 card token`)
    }
  }
}
