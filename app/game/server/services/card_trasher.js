CardTrasher = class CardTrasher {

  constructor(game, player_cards, source, cards, trashed_by) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    if (!cards) {
      cards = player_cards[source]
    } else if (!_.isArray(cards)) {
      cards = [cards]
    }
    this.cards = _.clone(cards)
    this.trashed_cards = []
    this.trashed_by = trashed_by
  }

  trash() {
    if (!_.isEmpty(this.cards)) {
      let events = this.has_events()
      if (_.size(this.cards) > 1 && events) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to trash cards: (leftmost will be first)',
          cards: this.cards
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
        turn_event_processor.process(CardTrasher.order_cards)
      }

      _.each(this.cards, (trashed_card) => {
        if (events) {
          this.update_log(trashed_card)
        }
        this.put_card_in_trash(trashed_card)
        let trash_event_processor = new TrashEventProcessor(this, trashed_card)
        trash_event_processor.process()
      })

      if (!events && !_.isEmpty(this.trashed_cards)) {
        this.update_log(this.trashed_cards)
      }
    }
    return this.trashed_cards
  }

  has_events() {
    return _.some(this.cards, (card) => {
      let trash_event_processor = new TrashEventProcessor(this, card)
      return !_.isEmpty(trash_event_processor.trash_events)
    })
  }

  put_card_in_trash(trashed_card) {
    let destination
    if (this.possessed()) {
      destination = this.player_cards.possession_trash
    } else {
      destination = this.game.trash
    }

    let card_mover = new CardMover(this.game, this.player_cards)
    if (card_mover.move(this.player_cards[this.source], destination, trashed_card)) {
      this.trashed_cards.push(trashed_card)
    }
  }

  update_log(cards) {
    let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> trashes ${CardView.render(cards)}`
    if (this.possessed()) {
      let card_text = _.size(cards) === 1 ? 'card' : 'cards'
      log_message += ', setting the ${card_text} aside'
    }
    this.game.log.push(log_message)
  }

  possessed() {
    this.game.turn.possessed && this.player_cards.player_id === this.game.turn.player._id
  }

  static order_cards(game, player_cards, ordered_cards, card_trasher) {
    card_trasher.cards = ordered_cards
  }

}
