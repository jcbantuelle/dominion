VictoryTokenGainer = class VictoryTokenGainer {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  gain(amount) {
    this.player_cards.victory_tokens += amount
    let source_text = this.source ? ` due to ${CardView.render(this.source)}` : ''
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes +${amount} &nabla;${source_text}`)
  }

}
