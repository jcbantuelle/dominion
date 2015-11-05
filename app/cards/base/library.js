Library = class Library extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      player_cards.aside = []
      return Library.draw_cards(game, player_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards to draw`)
    }
  }

  static draw_cards(game, player_cards) {
    if (_.size(player_cards.hand) >= 7 || (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0)) {
      if (_.size(player_cards.aside) > 0) {
        let card_discarder = new CardDiscarder(game, player_cards, 'aside')
        card_discarder.discard_all()
      }
      delete player_cards.aside
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }
      let top_card = player_cards.deck.shift()
      if (_.contains(top_card.types, 'action')) {
        player_cards.pending = top_card
        let turn_event_id = TurnEvents.insert({
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
        PlayerCards.update(player_cards._id, player_cards)
        Library.draw_cards(game, player_cards)
      }
    }
  }

  static card_choice(game, player_cards, response) {
    if (response === 'yes') {
      player_cards.hand.push(player_cards.pending)
      PlayerCards.update(player_cards._id, player_cards)
    } else {
      player_cards.aside.push(player_cards.pending)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(player_cards.pending)}`)
    }
    delete player_cards.pending
    Library.draw_cards(game, player_cards)
  }

}
