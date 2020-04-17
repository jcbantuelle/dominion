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
            let deck_shuffler = new DeckShuffler(this.game, this.player_cards)
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

  reveal_from_deck_until(termination_condition, show_others = true) {
    let revealed_cards = []
    while((_.size(this.player_cards.deck) > 0 || _.size(this.player_cards.discard) > 0) && !termination_condition(this.game, this.player_cards, revealed_cards)) {
      if (_.size(this.player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(this.game, this.player_cards)
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

}
