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
  }

  discard(announce = true) {
    if (!_.isEmpty(this.cards)) {
      let ordered_discard = this.has_events() || this.has_schemes()
      if (_.size(this.cards) > 1 && ordered_discard) {
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

      if (!ordered_discard && announce) {
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(this.cards)}${this.source_text()}`)
      }

      _.each(this.cards, (card_to_discard) => {
        if (ordered_discard && announce) {
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

  has_schemes() {
    return this.source === 'in_play' && this.game.turn.schemes > 0 && _.some(this.cards, (card) => {
      return _.includes(_.words(card.types), 'action')
    })
  }

  put_card_in_discard(card) {
    if (!card.destination) {
      card.destination = 'discard'
    }

    if (card.destination !== 'deck' && this.has_schemes() && _.includes(_.words(card.types), 'action')) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'choose_yes_no',
        instructions: `Place ${CardView.render(card)} on top of deck from ${CardView.render(new Scheme())}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, card)
      turn_event_processor.process(CardDiscarder.choose_scheme)
    }

    let source_text = ''
    if (card.destination === 'scheme') {
      source_text = ` from ${CardView.render(new Scheme())}`
      card.destination = 'deck'
    }
    let destination = card.destination
    delete card.destination

    let card_mover = new CardMover(this.game, this.player_cards)
    card_mover.move(this.player_cards[this.source], this.player_cards[destination], card)

    if (destination === 'deck') {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> places ${CardView.render(card)} on their deck${source_text}`)
    } else if (destination === 'aside') {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> sets aside ${CardView.render(card)}`)
    }

    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
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

  static choose_scheme(game, player_cards, response, card) {
    if (response === 'yes') {
      game.turn.schemes -= 1
      card.destination = 'scheme'
    }
  }

}
