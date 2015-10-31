Chancellor = class Chancellor extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    if (_.size(player_cards.deck) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        type: 'choose_yes_no',
        instructions: 'Put Deck In Discard?',
        minimum: 1,
        maximum: 1,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(this.discard_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but the deck is empty`)
      Games.update(game._id, game)
    }
  }

  discard_deck(game, player_cards, response) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;and discards their deck`)
      let card_discarder = new CardDiscarder(game, player_cards, 'deck');
      [game, player_cards] = card_discarder.discard_all()
      Games.update(game._id, game)
      PlayerCards.update(player_cards._id, player_cards)
    }
  }

}
