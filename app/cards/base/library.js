Library = class Library extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) >= 7) {
      game.log.push(`&nbsp;&nbsp;but ${player_cards.username} already has 7 cards in hand`)
    } else if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      if (player_cards.tokens.minus_card) {
        this.game.log.push(`&nbsp;&nbsp;${this.player_cards.username} discards their -1 card token`)
        delete this.player_cards.tokens.minus_card
      }
      player_cards.aside = []
      return Library.draw_cards(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards to draw`)
    }
  }

  static draw_cards(game, player_cards) {
    if (_.size(player_cards.hand) >= 7 || (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0)) {
      if (_.size(player_cards.aside) > 0) {
        let card_discarder = new CardDiscarder(game, player_cards, 'aside', _.pluck(player_cards.aside, 'name'))
        card_discarder.discard()
      }
      delete player_cards.aside
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let top_card = player_cards.deck.shift()
      if (_.contains(_.words(top_card.types), 'action')) {
        player_cards.pending = top_card
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Put ${CardView.render(player_cards.pending)} in Hand?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Library.card_choice)
      } else {
        player_cards.hand.push(top_card)
        PlayerCardsModel.update(game._id, player_cards)
        Library.draw_cards(game, player_cards)
      }
    }
  }

  static card_choice(game, player_cards, response) {
    if (response === 'yes') {
      player_cards.hand.push(player_cards.pending)
      PlayerCardsModel.update(game._id, player_cards)
    } else {
      player_cards.aside.push(player_cards.pending)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(player_cards.pending)}`)
    }
    delete player_cards.pending
    Library.draw_cards(game, player_cards)
  }

}
