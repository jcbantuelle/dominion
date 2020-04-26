CardRevealer = class CardRevealer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  reveal(source, cards) {
    if (!cards) {
      cards = this.player_cards[source]
    } else if (!_.isArray(cards)) {
      cards = [cards]
    }
    if (_.size(cards) === 0) {
      this.game.log.push(`&nbsp;&nbsp;but <strong>${this.player_cards.username}</strong> has nothing to reveal`)
    } else {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> reveals ${CardView.render(cards)}`)

      if (this.has_events(cards)) {
        GameModel.update(this.game._id, this.game)
        if (_.size(cards) > 1) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.game._id,
            player_id: this.player_cards.player_id,
            username: this.player_cards.username,
            type: 'sort_cards',
            instructions: 'Choose order to resolve revealed cards: (leftmost will be first)',
            cards: cards
          })
          let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
          cards = turn_event_processor.process(CardRevealer.order_cards)
        }
        _.each(cards, (card) => {
          let reveal_event_processor = new RevealEventProcessor(this, card)
          reveal_event_processor.process()
        })
      }
    }
  }

  look(cards) {
    if (_.size(cards) === 0) {
      this.game.log.push(`&nbsp;&nbsp;but <strong>${this.player_cards.username}</strong> has no cards to look at`)
    } else {
      let card_text = _.size(cards) === 1 ? 'card' : 'cards'
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> looks at ${_.size(cards)} ${card_text}`)
    }
  }

  reveal_from_deck(number_to_reveal, show_others = true) {
    let revealed_cards = []
    if (_.size(this.player_cards.deck) !== 0 || _.size(this.player_cards.discard) !== 0) {
      _.times(number_to_reveal, (count) => {
        if (_.size(this.player_cards.deck) === 0 && _.size(this.player_cards.discard) === 0) {
          return false
        } else {
          if (_.size(this.player_cards.deck) === 0) {
            let deck_shuffler = new DeckShuffler(this.game, this.player_cards, revealed_cards)
            deck_shuffler.shuffle()
          }
          revealed_cards.push(this.player_cards.deck.splice(0, 1)[0])
        }
      })
    }
    this.player_cards.revealed = revealed_cards
    if (show_others) {
      this.reveal('revealed')
    } else {
      this.look(revealed_cards)
    }
  }

  reveal_from_deck_until(termination_condition, show_others = true, termination_params) {
    let revealed_cards = []
    while((_.size(this.player_cards.deck) > 0 || _.size(this.player_cards.discard) > 0) && !termination_condition(this.game, this.player_cards, revealed_cards, termination_params)) {
      if (_.size(this.player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(this.game, this.player_cards, revealed_cards)
        deck_shuffler.shuffle()
      }
      revealed_cards.push(this.player_cards.deck.shift())
    }
    this.player_cards.revealed = revealed_cards
    if (show_others) {
      this.reveal('revealed')
    } else {
      this.look(revealed_cards)
    }
  }

  has_events(cards) {
    return _.some(cards, (card) => {
      let reveal_event_processor = new RevealEventProcessor(this, card)
      return !_.isEmpty(reveal_event_processor.reveal_events)
    })
  }

  static order_cards(game, player_cards, ordered_cards) {
    return ordered_cards
  }

}
