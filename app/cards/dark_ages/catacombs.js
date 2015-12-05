Catacombs = class Catacombs extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `${CardView.render(player_cards.revealed)}`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Put cards in hand', value: 'keep'},
          {text: 'Discard and draw 3 cards', value: 'discard'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Catacombs.process_response)
    }
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'keep') {
      player_cards.hand = player_cards.hand.concat(player_cards.revealed)
      player_cards.revealed = []
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts the cards in their hand`)
    } else if (response === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard_all()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)
    }
  }

}
