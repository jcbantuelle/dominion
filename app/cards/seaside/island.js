Island = class Island extends Card {

  types() {
    return ['action', 'victory']
  }

  coin_cost() {
    return 4
  }

  victory_points() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.island, card_player.card)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(card_player.card)}`)
    }

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to set aside:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Island.set_aside_card)
    } else if (_.size(player_cards.hand) === 1) {
      Island.set_aside_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no other cards in hand`)
    }
  }

  static set_aside_card(game, player_cards, selected_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.island, selected_cards[0])

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(selected_cards)}`)
  }

}
