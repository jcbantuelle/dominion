ActionGainer = class ActionGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount, announce = true) {
    this.game.turn.actions += amount
    if (announce) {
      let action_text = amount == 1 ? 'action' : 'actions'
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${action_text}`)
    }
    return amount
  }

}
