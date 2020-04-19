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
        instructions: 'Name a card: (or none to skip)',
        cards: unique_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Doctor.name_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_cards)}`)

    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal_from_deck(3)

    let matches = _.filter(player_cards.revealed, (card) => {
      return !_.isEmpty(selected_cards) && card.name === selected_cards[0].name
    })

    let card_trasher = new CardTrasher(game, player_cards, 'revealed', matches)
    card_trasher.trash()

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.revealed)
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

    _.times(amount, () => {
      if (_.isEmpty(player_cards.deck) && _.isEmpty(player_cards.discard)) {
        game.log.push(`&nbsp;&nbsp;but there are no cards left in their deck`)
        return false
      } else {
        let card_revealer = new CardRevealer(game, player_cards)
        card_revealer.reveal_from_deck(1, false)

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
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed')
      card_trasher.trash()
    } else if (response[0] === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else if (response[0] === 'return') {
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
