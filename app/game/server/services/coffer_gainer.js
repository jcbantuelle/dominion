CofferGainer = class CofferGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount, announce = true) {
    this.player_cards.coffers += amount
    if (announce) {
      let coffer_text = amount == 1 ? 'coffer' : 'coffers'
      let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${coffer_text}${source_text}`)
    }
    return amount
  }

}
