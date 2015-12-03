CardTrasher = class CardTrasher {

  constructor(game, player_cards, source, card_names) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    this.card_names = _.isArray(card_names) ? card_names : [card_names]
    this.trashed_cards = []
  }

  trash() {
    let has_event_cards = _.any(this.card_names, (card_name) => {
      return _.contains(TrashEventProcessor.event_cards(), card_name)
    })
    let has_reaction_cards = _.any(this.player_cards.hand, (card) => {
      return _.contains(TrashEventProcessor.reaction_cards(), card.name)
    })
    if (_.size(this.card_names) > 1 && (has_event_cards || has_reaction_cards)) {
      let card_list = _.map(this.card_names, function(card_name) {
        return ClassCreator.create(card_name).to_h()
      })
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to trash cards: (leftmost will be first)',
        cards: card_list
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
      turn_event_processor.process(CardTrasher.order_cards)
    }
    _.each(this.card_names, (card_name) => {
      let card_index = this.find_card_index(card_name)
      let trashed_card = this.player_cards[this.source].splice(card_index, 1)[0]
      this.player_cards.trashing.push(trashed_card)
      this.trashed_card_count = _.size(this.player_cards.trashing)
      this.update_log(trashed_card)
      let trash_event_processor = new TrashEventProcessor(this, trashed_card)
      trash_event_processor.process()
      if (_.size(this.player_cards.trashing) === this.trashed_card_count) {
        this.trash_card(card_index)
      }
    })
  }

  find_card_index(card_name) {
    return _.findIndex(this.player_cards[this.source], (card) => {
      return card.name === card_name
    })
  }

  trash_card(card_index) {
    let trashed_card = this.player_cards.trashing.pop()
    if (this.game.turn.possessed) {
      this.player_cards.possession_trash.push(trashed_card)
    } else {
      this.game.trash.push(trashed_card)
    }
    this.trashed_cards = this.trashed_cards.concat(this.player_cards[this.source].splice(card_index, 1))
  }

  update_log(card) {
    let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> trashes ${CardView.render(card)}`
    if (this.game.turn.possessed) {
      log_message += ', setting the cards aside'
    }
    this.game.log.push(log_message)
  }

  static order_cards(game, player_cards, ordered_card_names, trasher) {
    trasher.card_names = ordered_card_names
  }

}
