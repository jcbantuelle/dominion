Doctor = class Doctor extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let unique_cards = _.uniqBy(AllPlayerCardsQuery.find(player_cards), 'name')

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card:',
        cards: unique_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Doctor.name_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_card)}`)

    player_cards.revealed = _.take(player_cards.deck, 3)
    player_cards.deck = _.drop(player_cards.deck, 3)

    let revealed_card_count = _.size(player_cards.revealed)
    if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
      let deck_shuffler = new DeckShuffler(game, player_cards)
      deck_shuffler.shuffle()
      player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
      player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
    }

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
    let matches = _.filter(player_cards.revealed, function(card) {
      return card.id === selected_card.id
    })

    let card_trasher = new CardTrasher(game, player_cards, 'revealed', matches)
    card_trasher.trash()

    if (_.size(player_cards.revealed) > 1) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: player_cards.revealed
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Doctor.replace_cards)
    } else if (_.size(player_cards.revealed) === 1) {
      Doctor.replace_cards(game, player_cards, _.map(player_cards.revealed, 'name'))
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function(card) {
        return card.id === ordered_card.id
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards back on their deck`)
    player_cards.revealed = []
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
    turn_event_processor.process(Doctor.overpay)
  }

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
    game.turn.coins -= amount

    _.times(amount, function() {
      if (_.isEmpty(player_cards.deck) && _.isEmpty(player_cards.discard)) {
        game.log.push(`&nbsp;&nbsp;but there are no cards left in their deck`)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top card of their deck`)
        if (_.isEmpty(player_cards.deck)) {
          let deck_shuffler = new DeckShuffler(game, player_cards)
          deck_shuffler.shuffle()
        }

        player_cards.revealed.push(player_cards.deck.shift())

        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_options',
          instructions: `Choose what to do with ${CardView.render(player_cards.revealed)}:`,
          minimum: 1,
          maximum: 1,
          options: [
            {text: 'Trash it', value: 'trash'},
            {text: 'Discard it', value: 'discard'},
            {text: 'Put it back', value: 'return'}
          ]
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Doctor.process_response)
      }
      GameModel.update(game._id, game)
    })
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed')
      card_trasher.trash()
    } else if (response === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else if (response === 'return') {
      player_cards.deck.unshift(player_cards.revealed.pop())
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts the card back on top of their deck`)
    }
  }

}
