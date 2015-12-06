Loan = class Loan extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    game.turn.coins += 1

    this.reveal(game, player_cards)

    if (player_cards.revealed_treasure) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `Trash or Discard ${CardView.render(player_cards.revealed_treasure)}:`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Discard', value: 'discard'},
          {text: 'Trash', value: 'trash'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Loan.process_response)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not have any treasures in their deck`)
    }
    delete player_cards.revealed_treasure

    let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
    card_discarder.discard()
  }

  reveal(game, player_cards) {
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && !player_cards.revealed_treasure) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      player_cards.revealed.push(card)
      if (_.contains(_.words(card.types), 'treasure')) {
        player_cards.revealed_treasure = card
      }
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', player_cards.revealed_treasure.name)
      card_trasher.trash()
    }
  }

}
