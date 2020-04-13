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
    } else {
      if (player_cards.tokens.minus_card) {
        game.log.push(`&nbsp;&nbsp;${player_cards.username} discards their -1 card token`)
        delete player_cards.tokens.minus_card
      }
      if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
        player_cards.aside = []
        Library.draw_cards(game, player_cards)
        let card_text = _.size(player_cards.hand) === 1 ? 'card' : 'cards'
        game.log.push(`&nbsp;&nbsp;${player_cards.username} draws up to ${_.size(player_cards.hand)} ${card_text} in hand`)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards to draw`)
      }
    }
  }

  static draw_cards(game, player_cards) {
    if (_.size(player_cards.hand) >= 7 || (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0)) {
      if (_.size(player_cards.aside) > 0) {
        let card_discarder = new CardDiscarder(game, player_cards, 'aside')
        card_discarder.discard()
      }
      delete player_cards.aside
    } else {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(game, player_cards)
      }
      let drawn_card = player_cards.deck.shift()
      if (_.includes(_.words(drawn_card.types), 'action')) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_yes_no',
          instructions: `Put ${CardView.render(drawn_card)} in hand?`,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, drawn_card)
        turn_event_processor.process(Library.card_choice)
      } else {
        player_cards.hand.push(drawn_card)
        PlayerCardsModel.update(game._id, player_cards)
        Library.draw_cards(game, player_cards)
      }
    }
  }

  static card_choice(game, player_cards, response, drawn_card) {
    if (response === 'yes') {
      player_cards.hand.push(drawn_card)
      PlayerCardsModel.update(game._id, player_cards)
    } else {
      player_cards.aside.push(drawn_card)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(drawn_card)}`)
      GameModel.update(game._id, game)
    }
    Library.draw_cards(game, player_cards)
  }

}
