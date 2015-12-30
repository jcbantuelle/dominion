CoinGainer = class CoinGainer {

  static gain(game, player_cards, amount) {
    if (player_cards.tokens.minus_coin) {
      amount -= 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> discards their -$1 coin token`)
      delete player_cards.tokens.minus_coin
    }
    game.turn.coins += amount
    return amount
  }

}
