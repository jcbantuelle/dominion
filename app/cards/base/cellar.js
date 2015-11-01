Cellar = class Cellar extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.hand) > 0) {
      Games.update(game._id, game)
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to discard:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 0,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(this.discard_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      Games.update(game._id, game)
    }
  }

  discard_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand');
      [game, player_cards] = card_discarder.discard_some(selected_cards)

      let card_drawer = new CardDrawer(game, player_cards);
      [game, player_cards] = card_drawer.draw(_.size(selected_cards))
    }
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
