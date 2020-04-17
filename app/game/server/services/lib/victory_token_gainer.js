VictoryTokenGainer = class VictoryTokenGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount) {
    this.player_cards.victory_tokens += amount
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> takes +${amount} &nabla;`)
  }

}
