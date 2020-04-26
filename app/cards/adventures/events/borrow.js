Borrow = class Borrow extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (!player_cards.tokens.minus_card) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes their -1 card token`)
      player_cards.tokens.minus_card = true

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has their -1 card token`)
    }
  }
}
