Embassy = class Embassy extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(5)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 3) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Discard 3 cards:',
        cards: player_cards.hand,
        minimum: 3,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Embassy.discard_cards)
    } else if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

  gain_event(gainer) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(gainer.game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let card_gainer = new CardGainer(gainer.game, other_player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    })
  }

}
