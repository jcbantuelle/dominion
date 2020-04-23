Donate = class Donate extends Event {

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  buy(game, player_cards) {
    game.turn.donate = true
  }

  between_turn_event(game, player_cards, donate) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> processes ${CardView.render(donate)}`)

    let card_mover = new CardMover(game, player_cards)
    card_mover.move_all(player_cards.deck, player_cards.hand)
    card_mover.move_all(player_cards.discard, player_cards.hand)

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to trash:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, donate)
      turn_event_processor.process(Donate.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards to trash for ${CardView.render(donate)}`)
    }
  }

  static trash_cards(game, player_cards, selected_cards, donate) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to trash anything for ${CardView.render(donate)}`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    }

    let deck_shuffler = new DeckShuffler(game, player_cards)
    deck_shuffler.shuffle('hand')

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(5)
  }

}


