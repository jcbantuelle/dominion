SupplyCardExiler = class SupplyCardExiler {

  constructor(game, player_cards, stack_name, card) {
    this.game = game
    this.player_cards = player_cards
    this.exile_stack = _.find(game.cards, (card) => {
      return card.stack_name === stack_name
    })
    this.card = card
  }

  exile() {
    this.update_log()
    if (this.can_exile()) {
      this.exile_card()
    }
  }

  can_exile() {
    return this.exile_stack && this.exile_stack.count > 0 && this.exile_stack.top_card.name === this.card.name
  }

  update_log() {
    if (this.can_exile()) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> exiles ${CardView.render(this.exile_stack.top_card)} from the supply`)
    } else {
      this.game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this.card)} to exile`)
    }
  }

  exile_card() {
    this.player_cards.exile.push(this.exile_stack.top_card)
    this.exile_stack.stack.shift()
    this.exile_stack.count -= 1
    if (this.exile_stack.count > 0) {
      this.exile_stack.top_card = _.head(this.exile_stack.stack)
    }
  }

}
