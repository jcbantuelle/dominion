Sentry = class Sentry extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    PlayerCardsModel.update(game._id, player_cards)
    GameModel.update(game._id, game)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(2, false)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to trash (you may discard after this):',
        cards: player_cards.revealed,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Sentry.trash_cards)

      if (_.size(player_cards.revealed) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose any number of cards to discard:',
          cards: player_cards.revealed,
          minimum: 0,
          maximum: 0
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Sentry.discard_cards)
      }

      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards)
      card_trasher.trash()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed', selected_cards)
      card_discarder.discard()
    }
  }

}