CardRevealer = class CardRevealer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  reveal(cards) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> reveals ${CardView.render(cards)}`)
  }

}
