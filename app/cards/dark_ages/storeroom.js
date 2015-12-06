Storeroom = class Storeroom extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

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
      turn_event_processor.process(Storeroom.discard_for_cards)

      if (_.size(player_cards.hand) > 0) {
        PlayerCardsModel.update(game._id, player_cards)
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
        turn_event_processor.process(Storeroom.discard_for_coins)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static discard_for_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(selected_cards))
    }
  }

  static discard_for_coins(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_discarder.discard()

      game.turn.coins += _.size(selected_cards)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${_.size(selected_cards)}`)
    }
  }

}
