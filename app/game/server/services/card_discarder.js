CardDiscarder = class CardDiscarder {

  constructor(game, player_cards, source, cards) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    if (!cards) {
      cards = player_cards[source]
    } else if (!_.isArray(cards)) {
      cards = [cards]
    }
    this.cards = _.clone(cards)
    this.discard_reaction_cards = ['Tunnel']
  }

  discard(announce = true) {
    if (!_.isEmpty(this.cards)) {
      let events = this.has_events()
      if (_.size(this.cards) > 1 && events) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to discard cards: (leftmost will be first)',
          cards: this.cards
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
        turn_event_processor.process(CardDiscarder.order_cards)
      }

      if (!events && announce) {
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(this.cards)}${this.source_text()}`)
      }

      _.each(this.cards, (card_to_discard) => {
        if (events && announce) {
          this.update_log(card_to_discard)
        }
        let discard_event_processor = new DiscardEventProcessor(this, card_to_discard)
        discard_event_processor.process()
        this.put_card_in_discard(card_to_discard)
      })
    }
  }

  has_events() {
    return _.some(this.cards, (card) => {
      let discard_event_processor = new DiscardEventProcessor(this, card)
      return !_.isEmpty(discard_event_processor.discard_events)
    })
  }

  put_card_in_discard(card) {
    let destination = card.destination ? card.destination : 'discard'
    delete card.destination

    let card_mover = new CardMover(this.game, this.player_cards)
    card_mover.move(this.player_cards[this.source], this.player_cards[destination], card)

    if (destination === 'deck') {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> places ${CardView.render(card)} on their deck`)
    } else if (destination === 'aside') {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> sets aside ${CardView.render(card)}`)
    }
  }

  update_log(card) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(card)}${this.source_text()}`)
  }

  source_text() {
    return this.source === 'deck' ? ' from the top of their deck' : ''
  }

  static order_cards(game, player_cards, ordered_cards, card_discarder) {
    card_discarder.cards = ordered_cards
  }

}
