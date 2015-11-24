Treasury = class Treasury extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$1`)
  }

  discard_from_play(game, player_cards) {
    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(this)} On Top of Deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Treasury.put_on_deck)
  }

  static put_on_deck(game, player_cards, response) {
    if (response === 'yes') {
      player_cards.deck.unshift(player_cards.discarding.pop())
      game.log.push(`<strong>${player_cards.username}</strong> puts ${CardView.card_html('action', 'Treasury')} on top of their deck`)
    }
  }

}
