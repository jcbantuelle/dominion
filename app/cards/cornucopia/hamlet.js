Hamlet = class Hamlet extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to discard for +1 action (or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, 'action')
      turn_event_processor.process(Hamlet.discard_for_effect)

      if (_.size(player_cards.hand) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to discard for +1 buy (or none to skip):',
          cards: player_cards.hand,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, 'buy')
        turn_event_processor.process(Hamlet.discard_for_effect)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static discard_for_effect(game, player_cards, selected_cards, effect) {
    if (!_.isEmpty(selected_cards)) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      if (effect === 'action') {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(1)
      } else if (effect === 'buy') {
        let buy_gainer = new BuyGainer(game, player_cards)
        buy_gainer.gain(1)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to discard for +1 ${effect}`)
    }
    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)
  }

}
