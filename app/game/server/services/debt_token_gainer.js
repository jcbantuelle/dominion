DebtTokenGainer = class DebtTokenGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount) {
    if (this.game.turn.possessed) {
      this.player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
    }

    this.player_cards.debt_tokens += amount
    let token_text = amount === 1 ? 'token' : 'tokens'
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes ${amount} debt ${token_text}`)

    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

}
