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
    this.cards = cards
    this.discard_reaction_cards = ['Tunnel']
  }

  discard(announce = true) {
    if (!_.isEmpty(this.cards)) {
      _.each(this.cards, (card) => {
        this.player_cards.to_discard.push(this.find_card(card))
      })
      this.player_cards.to_discard = _.compact(this.player_cards.to_discard)

      if (!_.isEmpty(this.player_cards.to_discard)) {

        let events = this.has_events()
        if (_.size(this.player_cards.to_discard) > 1 && events) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.game._id,
            player_id: this.player_cards.player_id,
            username: this.player_cards.username,
            type: 'sort_cards',
            instructions: 'Choose order to discard cards: (leftmost will be first)',
            cards: this.player_cards.to_discard
          })
          let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
          turn_event_processor.process(CardDiscarder.order_cards)
        }

        if (!events && announce) {
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(this.player_cards.to_discard)}`)
        }

        var discarded_card
        do {
          discarded_card = this.player_cards.to_discard.shift()
          if (discarded_card) {
            this.track_discarded_card(discarded_card)
            if (events && announce) {
              this.update_log(discarded_card)
            }
            let discard_event_processor = new DiscardEventProcessor(this, discarded_card)
            discard_event_processor.process()
            this.put_card_in_discard()
          }
        } while (discarded_card)
      }
    }
  }

  put_card_in_discard() {
    if (_.size(this.player_cards.discarding) === this.discarded_card_count) {
      let discarding_card = this.player_cards.discarding.pop()
      let destination = 'discard'
      if (discarding_card.scheme) {
        destination = 'deck'
        delete discarding_card.scheme
        delete discarding_card.prince
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> places ${CardView.render(discarding_card)} on their deck`)
      }
      if (discarding_card.prince) {
        destination = 'princed'
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> sets aside ${CardView.render(discarding_card)} from ${CardView.render(new Prince())}`)
      }
      if (discarding_card.misfit) {
        discarding_card = discarding_card.misfit
      }
      this.player_cards[destination].unshift(discarding_card)
    }
  }

  has_events() {
    let has_event_cards = _.some(this.player_cards.to_discard, (card) => {
      let discard_event_processor = new DiscardEventProcessor(this, card)
      return !_.isEmpty(discard_event_processor.discard_events)
    })
    let multiple_schemes = _.size(_.filter(this.player_cards.to_discard, function(card) {
      return card.scheme
    })) > 1
    return (has_event_cards || multiple_schemes)
  }

  find_card(card_to_discard) {
    let card_index = _.findIndex(this.player_cards[this.source], (card) => {
      return card.id === card_to_discard.id
    })
    if (card_index !== -1) {
      return this.player_cards[this.source].splice(card_index, 1)[0]
    } else {
      return undefined
    }
  }

  track_discarded_card(discarded_card) {
    this.player_cards.discarding.push(discarded_card)
    this.discarded_card_count = _.size(this.player_cards.discarding)
  }

  update_log(card) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(card)}`)
  }

  static order_cards(game, player_cards, ordered_cards) {
    let new_discard_order = []
    _.each(ordered_cards, function(ordered_card) {
      let discard_card_index = _.findIndex(player_cards.to_discard, function(card) {
        return card.id === ordered_card.id
      })
      new_discard_order.push(player_cards.to_discard.splice(discard_card_index, 1)[0])
    })
    player_cards.to_discard = new_discard_order
  }

}
