Transport = class Transport extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Exile Action From Supply', value: 'exile'},
        {text: 'Take Action From Exile', value: 'take'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let response = turn_event_processor.process(Transport.process_response)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to ${response} an action`)
    GameModel.update(game._id, game)

    if (response === 'exile') {
      let eligible_cards = _.filter(game.cards, (card) => {
        return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action')
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose an action to exile:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        let card_to_exile = turn_event_processor.process(Transport.exile_card)
      } else if (_.size(eligible_cards) === 1) {
        Transport.exile_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no actions to exile`)
      }
    } else if (response === 'take') {
      let eligible_cards = _.filter(player_cards.exile, function(card) {
        return _.includes(_.words(card.types), 'action')
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a action to take from exile:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Transport.take_action)
      } else if (_.size(eligible_cards) === 1) {
        Transport.take_action(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but has no actions in their exile`)
      }
    }
  }

  static process_response(game, player_cards, response) {
    return response[0]
  }

  static exile_card(game, player_cards, selected_cards) {
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, selected_cards[0].stack_name, selected_cards[0].top_card)
    supply_card_exiler.exile()
  }

  static take_action(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.exile, player_cards.deck, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(selected_cards)} on their deck`)
  }

}
