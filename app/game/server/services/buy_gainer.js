BuyGainer = class BuyGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount, announce = true) {
    if (this.player_cards.player_id === this.game.turn.player._id) {
      this.game.turn.buys += amount
      if (announce) {
        let buy_text = amount == 1 ? 'buy' : 'buys'
        let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${buy_text}${source_text}`)
      }
      return amount
    }
  }

}