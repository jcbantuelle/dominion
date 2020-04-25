Cathedral = class Cathedral extends Project {

  coin_cost() {
    return 3
  }

  start_turn_event(game, player_cards, cathedral) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(cathedral)}`)
    GameModel.update(game._id, game)
    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Trash a card:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Cathedral.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      Cathedral.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
