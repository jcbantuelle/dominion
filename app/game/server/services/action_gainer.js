ActionGainer = class ActionGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount, announce = true) {
    if (this.game.turn.no_more_actions) {
      amount = 0
    }
    this.game.turn.actions += amount
    if (announce) {
      let action_text = amount == 1 ? 'action' : 'actions'
      let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${action_text}${source_text}`)
    }
    return amount
  }

}
