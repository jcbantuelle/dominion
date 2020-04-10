Herald = class Herald extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      PlayerCardsModel.update(game._id, player_cards)

      if (_.isEmpty(player_cards.deck)) {
        DeckShuffler.shuffle(game, player_cards)
      }

      let top_card = player_cards.deck[0]
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(top_card)}`)

      if (_.includes(_.words(top_card.types), 'action')) {
        player_cards.hand.push(player_cards.deck.shift())
        let card_player = new CardPlayer(game, player_cards, top_card.id, true)
        card_player.play()
      } else {
        game.log.push(`&nbsp;&nbsp;putting it back on top of their deck`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  buy_event(buyer) {
    let turn_event_id = TurnEventModel.insert({
      game_id: buyer.game._id,
      player_id: buyer.player_cards.player_id,
      username: buyer.player_cards.username,
      type: 'overpay',
      player_cards: true,
      instructions: 'Choose an amount to overpay by:',
      minimum: 0,
      maximum: buyer.game.turn.coins
    })
    let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
    turn_event_processor.process(Herald.overpay)
  }

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
    game.turn.coins -= amount

    if (_.size(player_cards.discard) > amount) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose ${amount} cards to put on your deck:`,
        cards: player_cards.discard,
        minimum: amount,
        maximum: amount
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Herald.take_discarded_cards)
    } else if (_.size(player_cards.discard) > 0) {
      Herald.take_discarded_cards(game, player_cards, player_cards.discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not have any cards in their discard`)
    }
  }

  static take_discarded_cards(game, player_cards, selected_cards) {
    _.each(selected_cards, function(selected_card) {
      let discard_index = _.findIndex(player_cards.discard, function(discard_card) {
        return discard_card.id === selected_card.id
      })
      player_cards.revealed.push(player_cards.discard.splice(discard_index, 1)[0])
    })

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'sort_cards',
      instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
      cards: player_cards.revealed
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Herald.replace_cards)
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function(card) {
        return card.id === ordered_card.id
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the chosen cards on their deck`)
    player_cards.revealed = []
  }

}
