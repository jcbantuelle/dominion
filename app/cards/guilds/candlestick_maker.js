CandlestickMaker = class CandlestickMaker extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.turn.buys += 1
    player_cards.coin_tokens += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action, +1 buy, and takes a coin token`)
  }

}
