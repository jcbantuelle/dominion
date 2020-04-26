Envoy = class Envoy extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(5)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let player_to_left = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)[1]
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_to_left.player_id,
        username: player_to_left.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card for <strong>${player_cards.username}</strong> to discard:`,
        cards: player_cards.revealed,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Envoy.discard_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', selected_cards)
    card_discarder.discard()

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in their hand`)
    let card_mover = new CardMover(game, player_cards)
    card_mover.move_all(player_cards.revealed, player_cards.hand)
  }

}
