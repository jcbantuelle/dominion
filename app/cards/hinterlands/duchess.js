Duchess = class Duchess extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)

    let all_player_cards = this.other_players_cards(game, player_cards.username)
    all_player_cards.unshift(player_cards)

    _.each(all_player_cards, function(cards) {
      Duchess.reveal_card(game, cards)
    })
  }

  static reveal_card(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      if (_.size(player_cards.deck) === 0) {
        let deck_shuffler = new DeckShuffler(player_cards)
        deck_shuffler.shuffle()
      }

      let revealed_card = player_cards.deck.shift()
      player_cards.revealed.push(revealed_card)

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top card of their deck`)

      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(revealed_card)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Duchess.discard_card)
    }
  }

  static discard_card(game, player_cards, response) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()
    } else {
      let card = player_cards.revealed[0]
      player_cards.deck.unshift(card)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the card on top of their deck`)
    }
  }

}
