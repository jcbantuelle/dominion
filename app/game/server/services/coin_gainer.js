CoinGainer = class CoinGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount, announce = true) {
    if (this.player_cards.tokens.minus_coin) {
      amount -= 1
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards their -$1 coin token`)
      delete this.player_cards.tokens.minus_coin
    }
    this.game.turn.coins += amount
    if (announce) {
      let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +$${amount}${source_text}`)
    }
    return amount
  }

}
