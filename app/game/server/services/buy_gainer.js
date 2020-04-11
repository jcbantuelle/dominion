BuyGainer = class BuyGainer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  gain(amount, announce = true) {
    this.game.turn.buys += amount
    if (announce) {
      let buy_text = amount == 1 ? 'buy' : 'buys'
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${amount} ${buy_text}`)
    }
    return amount
  }

}