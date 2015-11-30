SecretChamber = class SecretChamber extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to discard:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SecretChamber.discard_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let discard_count = _.size(selected_cards)
    if (discard_count === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_some(selected_cards)

      game.turn.coins += discard_count
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${discard_count}`)
    }
  }

  attack_event(game, player_cards) {
    let secret_chamber_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === 'Secret Chamber'
    })
    player_cards.revealed.push(player_cards.hand.splice(secret_chamber_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(this)}`)

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let cards_in_hand = _.size(player_cards.hand)
    if (cards_in_hand > 2) {
      PlayerCards.update(player_cards._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose 2 cards to put on top of your deck:`,
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SecretChamber.return_to_deck)
    } else if (cards_in_hand === 2) {
      SecretChamber.return_to_deck(game, player_cards, player_cards.hand)
    } else if (cards_in_hand === 1) {
      SecretChamber.replace_cards(game, player_cards, [player_cards.hand[0].name])
    } else if (cards_in_hand === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }

    player_cards.hand = player_cards.hand.concat(player_cards.revealed)
    player_cards.revealed = []
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'sort_cards',
      instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
      cards: selected_cards
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(SecretChamber.replace_cards)
  }

  static replace_cards(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names.reverse(), function(card_name) {
      let returned_card_index = _.findIndex(player_cards.hand, function(card) {
        return card.name === card_name
      })
      let returned_card = player_cards.hand.splice(returned_card_index, 1)[0]
      player_cards.deck.unshift(returned_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${_.size(ordered_card_names)} cards back on their deck`)
  }

}
