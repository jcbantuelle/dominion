CardTrasher = class CardTrasher {

  constructor(game, player_cards, source, card_names) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    if (!card_names) {
      this.card_names = _.map(player_cards[source], 'name')
    } else {
      this.card_names = _.isArray(card_names) ? card_names : [card_names]
    }
  }

  trash() {
    _.each(this.card_names, (card_name) => {
      this.player_cards.trash.push(this.find_card(card_name))
    })
    this.player_cards.trash = _.compact(this.player_cards.trash)

    let events = this.has_events()
    if (_.size(this.player_cards.trash) > 1 && events) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to trash cards: (leftmost will be first)',
        cards: this.player_cards.trash
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
      turn_event_processor.process(CardTrasher.order_cards)
    }

    if (!events && !_.isEmpty(this.player_cards.trash)) {
      this.update_log(this.player_cards.trash)
    }

    _.each(this.player_cards.trash, (trashed_card) => {
      this.track_trashed_card(trashed_card)
      if (events) {
        this.update_log(trashed_card)
      }
      let trash_event_processor = new TrashEventProcessor(this, trashed_card)
      trash_event_processor.process()
      this.put_card_in_trash(trashed_card)

      _.times(this.game.turn.priests, () => {
        let gained_coins = CoinGainer.gain(this.game, this.player_cards, 2)
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(new Priest())}`)
      })
    })

    this.player_cards.trash = []
  }

  has_events() {
    let has_event_cards = _.some(this.card_names, (card_name) => {
      return _.includes(TrashEventProcessor.event_cards(), card_name)
    })
    let has_reaction_cards = _.some(this.player_cards.hand, (card) => {
      return _.includes(TrashEventProcessor.reaction_cards(), card.name)
    })
    return has_event_cards || has_reaction_cards
  }

  find_card(card_name) {
    let card_index = _.findIndex(this.player_cards[this.source], (card) => {
      return card.name === card_name
    })
    return card_index === -1 ? undefined : this.player_cards[this.source].splice(card_index, 1)[0]
  }

  track_trashed_card(trashed_card) {
    this.player_cards.trashing.push(trashed_card)
    this.trashed_card_count = _.size(this.player_cards.trashing)
  }

  put_card_in_trash() {
    if (_.size(this.player_cards.trashing) === this.trashed_card_count) {
      trashed_card = this.player_cards.trashing.pop()
      if (trashed_card.misfit) {
        trashed_card = trashed_card.misfit
      }
      if (this.game.turn.possessed && this.player_cards.player_id === this.game.turn.player._id) {
        this.player_cards.possession_trash.push(trashed_card)
      } else {
        if (trashed_card.name === 'Estate' && this.player_cards.tokens.estate) {
          trashed_card = ClassCreator.create('Estate').to_h()
        }
        this.game.trash.push(trashed_card)
      }
    }
  }

  update_log(cards) {
    let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> trashes ${CardView.render(cards)}`
    if (this.game.turn.possessed && this.player_cards.player_id === this.game.turn.player._id) {
      log_message += ', setting the card(s) aside'
    }
    this.game.log.push(log_message)
  }

  static order_cards(game, player_cards, ordered_card_names) {
    let new_trash_order = []
    _.each(ordered_card_names, function(card_name) {
      let trash_card_index = _.findIndex(player_cards.trash, function(card) {
        return card.name === card_name
      })
      new_trash_order.push(player_cards.trash.splice(trash_card_index, 1)[0])
    })
    player_cards.trash = new_trash_order
  }

}
