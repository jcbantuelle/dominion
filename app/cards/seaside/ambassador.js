Ambassador = class Ambassador extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
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
    } else if (_.size(player_cards.hand) === 1) {
      Ambassador.reveal_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    delete game.turn.ambassador_selected_card
    delete game.turn.ambassador_game_stack
  }

  attack(game, player_cards) {
    if (game.turn.ambassador_game_stack && game.turn.ambassador_game_stack.source !== 'not_supply' && game.turn.ambassador_game_stack.top_card.name === game.turn.ambassador_selected_card.name) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', game.turn.ambassador_game_stack.name)
      card_gainer.gain()
    }
  }

  static reveal_card(game, player_cards, selected_cards) {
    game.turn.ambassador_selected_card = selected_cards[0]
    game.turn.ambassador_game_stack = _.find(game.cards, function(card) {
      return card.name === game.turn.ambassador_selected_card.stack_name && card.supply
    })

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal(game.turn.ambassador_selected_card, game.turn.ambassador_selected_card)

    if (game.turn.ambassador_game_stack) {
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

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Choose how many copies of ${CardView.render(game.turn.ambassador_selected_card)} to return to supply:`,
        minimum: 1,
        maximum: 1,
        options: options
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, copies_in_hand)
      turn_event_processor.process(Ambassador.return_copies)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(game.turn.ambassador_selected_card)} is not in the supply`)
    }
  }

  static return_copies(game, player_cards, response, copies_in_hand) {
    response = response[0]
    if (response === '0') {
      game.log.push('&nbsp;&nbsp;but does not return any to the supply')
    } else {
      let cards_to_return = _.take(copies_in_hand, response)
      let card_mover = new CardMover(game, player_cards)
      card_mover.return_to_supply(player_cards.hand, game.turn.ambassador_game_stack.name, cards_to_return)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(cards_to_return)} to the supply`)
    }
  }

}
