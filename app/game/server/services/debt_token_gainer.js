DebtTokenGainer = class DebtTokenGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount) {
    if (this.game.turn.possessed) {
      this.player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
    }

    this.player_cards.debt_tokens += amount
    let token_text = amount === 1 ? 'token' : 'tokens'
    let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes ${amount} debt ${token_text}${source_text}`)

    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

}
