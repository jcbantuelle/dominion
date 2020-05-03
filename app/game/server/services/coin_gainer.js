CoinGainer = class CoinGainer {

  constructor(game, player_cards, card_player, source) {
    this.game = game
    this.player_cards = player_cards
    this.card_player = card_player
    this.source = source
  }

  gain(amount, announce = true) {
    if (this.card_player && this.card_player.chameleon) {
      let card_drawer = new CardDrawer(this.game, this.player_cards)
      card_drawer.draw(amount)
    } else {
      if (this.player_cards.player_id === this.game.turn.player._id) {
        if (this.player_cards.tokens.minus_coin && amount > 0) {
          amount -= 1
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards their -$1 coin token`)
          delete this.player_cards.tokens.minus_coin
        }
        this.game.turn.coins += amount
        if (announce) {
          let source_text = this.source ? ` from ${CardView.render(this.source)}` : ''
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +$${amount}${source_text}`)
        }
        return amount
      }
    }
  }

}
