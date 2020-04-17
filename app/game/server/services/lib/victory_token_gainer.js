VictoryTokenGainer = class VictoryTokenGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount) {
    if (this.game.turn.possessed) {
      this.player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
    }
    this.player_cards.victory_tokens += amount
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} &nabla;`)

    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

}
