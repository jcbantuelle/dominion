SupplyCardTrasher = class SupplyCardTrasher {

  constructor(game, player_cards, stack_name, card) {
    this.game = game
    this.player_cards = player_cards
    this.trash_stack = _.find(game.cards, (card) => {
      return card.stack_name === stack_name
    })
    this.card = card
  }

  trash() {
    this.update_log()
    this.trash_events()
    this.put_card_in_trash()
  }

  update_log() {
    if (this.trash_stack && this.trash_stack.count > 0 && this.trash_stack.top_card.name === this.card.name) {
      this.game.log.push(`&nbsp;&nbsp;${CardView.render(this.trash_stack.top_card)} is trashed from the supply`)
    } else {
      this.game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(this.card)} to trash`)
    }
  }

  trash_events() {
    let trash_event_processor = new TrashEventProcessor(this, this.trash_stack.top_card)
    trash_event_processor.process()
  }

  put_card_in_trash() {
    this.game.trash.push(this.trash_stack.top_card)
    this.trash_stack.stack.shift()
    this.trash_stack.count -= 1
    if (this.trash_stack.count > 0) {
      this.trash_stack.top_card = _.head(this.trash_stack.stack)
    }
  }

}
