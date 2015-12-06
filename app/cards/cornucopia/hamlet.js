Hamlet = class Hamlet extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.hand) > 0) {
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to discard for +1 action (Or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Hamlet.action_discard)

      if (_.size(player_cards.hand) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to discard for +1 buy (Or none to skip):',
          cards: player_cards.hand,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Hamlet.buy_discard)
      }
    }
  }

  static action_discard(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_discarder.discard()

      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

      PlayerCardsModel.update(game._id, player_cards)
    }
  }

  static buy_discard(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_discarder.discard()

      game.turn.buys += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
    }
  }

}
