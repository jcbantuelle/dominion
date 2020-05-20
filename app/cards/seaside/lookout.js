Lookout = class Lookout extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(3, false)

      GameModel.update(game._id, game)

      if (_.size(player_cards.revealed) === 1) {
        let card_trasher = new CardTrasher(game, player_cards, 'revealed')
        card_trasher.trash()
        game.log.push(`&nbsp;&nbsp;but has no cards left to continue`)
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: game.turn.player._id,
          username: game.turn.player.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to trash:`,
          cards: player_cards.revealed,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Lookout.trash_card)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'revealed', selected_cards[0])
    card_trasher.trash()
    if (_.size(player_cards.revealed) === 1) {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
      game.log.push(`&nbsp;&nbsp;but has no cards left to continue`)
    } else {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: game.turn.player._id,
        username: game.turn.player.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to discard:`,
        cards: player_cards.revealed,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Lookout.discard_card)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', selected_cards)
    card_discarder.discard()

    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.revealed)
  }

}
