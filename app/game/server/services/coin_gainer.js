CoinGainer = class CoinGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount, announce = true) {
    if (this.player_cards.tokens.minus_coin) {
      amount -= 1
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards their -$1 coin token`)
      delete this.player_cards.tokens.minus_coin
    }
    this.game.turn.coins += amount
    if (announce) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +$${amount}`)
    }
    return amount
  }

}
