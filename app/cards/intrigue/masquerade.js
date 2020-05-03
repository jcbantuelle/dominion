Masquerade = class Masquerade extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    PlayerCardsModel.update(game._id, player_cards)

    let ordered_player_cards = _.filter(TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards), (current_player_cards) => {
      let hand_size = _.size(current_player_cards.hand)
      if (hand_size === 0) {
        game.log.push(`&nbsp;&nbsp;<strong>${current_player_cards.username}</strong> has no cards in hand and does not particpate`)
      } else {
        current_player_cards.masquerade = []
      }
      return _.size(current_player_cards.hand) > 0
    })
    _.each(ordered_player_cards, (current_player_cards, index) => {
      let pass_to_index = index === (_.size(ordered_player_cards) - 1) ? 0 : index + 1
      let pass_to_player_cards = ordered_player_cards[pass_to_index]

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: current_player_cards.player_id,
        username: current_player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to pass to ${pass_to_player_cards.username}:`,
        cards: current_player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, current_player_cards, turn_event_id, pass_to_player_cards)
      turn_event_processor.process(Masquerade.pass_card)
    })

    _.each(ordered_player_cards, function(current_player_cards) {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(current_player_cards.masquerade, current_player_cards.hand, current_player_cards.masquerade[0])
      delete current_player_cards.masquerade
      PlayerCardsModel.update(game._id, current_player_cards)
    })

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Masquerade.trash_cards)
    }
  }

  static pass_card(game, player_cards, selected_cards, pass_to_player_cards) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, pass_to_player_cards.masquerade, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> passes a card to ${pass_to_player_cards.username}`)
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    }
  }

}
