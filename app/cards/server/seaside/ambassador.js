Ambassador = class Ambassador extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Reveal a card from your hand:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Ambassador.reveal_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  attack(game, player_cards) {
    if (game.turn.ambassador_game_stack && game.turn.ambassador_game_stack.top_card.name === game.turn.ambassador_selected_card.name) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', game.turn.ambassador_game_stack.name)
      card_gainer.gain_game_card()
    }
  }

  cleanup(game, player_cards) {
    delete game.turn.ambassador_selected_card
    delete game.turn.ambassador_game_stack
  }

  static reveal_card(game, player_cards, selected_cards) {
    game.turn.ambassador_selected_card = selected_cards[0]
    game.turn.ambassador_game_stack = _.find(game.cards, function(card) {
      return card.name === game.turn.ambassador_selected_card.stack_name
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(game.turn.ambassador_selected_card)}`)

    if (_.contains(['kingdom', 'common'], game.turn.ambassador_game_stack.source)) {

      let copies_in_hand = _.filter(player_cards.hand, function(card) {
        return card.name === game.turn.ambassador_selected_card.name
      })

      let options = [
        {text: '0', value: 0},
        {text: '1', value: 1}
      ]
      if (_.size(copies_in_hand) > 1) {
        options.push({text: '2', value: 2})
      }

      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose how many copies of ${CardView.render(game.turn.ambassador_selected_card)} to return to supply:`,
        minimum: 1,
        maximum: 1,
        options: options
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Ambassador.return_copies)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(game.turn.ambassador_selected_card)} is not in the supply`)
      delete game.turn.ambassador_selected_card
      delete game.turn.ambassador_game_stack
    }
  }

  static return_copies(game, player_cards, response) {
    response = response[0]

    if (response === '0') {
      game.log.push('&nbsp;&nbsp;but does not return any to the supply')
    } else {
      let returned_card_indexes = []
      returned_card_indexes.push(_.findIndex(player_cards.hand, function(card) {
        return card.name === game.turn.ambassador_selected_card.name
      }))
      if (response === '2') {
        returned_card_indexes.push(_.findLastIndex(player_cards.hand, function(card) {
          return card.name === game.turn.ambassador_selected_card.name
        }))
      }

      let returned_cards = _.pullAt(player_cards.hand, returned_card_indexes)

      game.turn.ambassador_game_stack.count += _.size(returned_card_indexes)
      game.turn.ambassador_game_stack.stack = returned_cards.concat(game.turn.ambassador_game_stack.stack)
      game.turn.ambassador_game_stack.top_card = _.first(game.turn.ambassador_game_stack.stack)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(returned_cards)} to the supply`)
    }
  }

}
