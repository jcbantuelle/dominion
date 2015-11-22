Stables = class Stables extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to discard (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Stables.discard_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_some(selected_cards)

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)

      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    }
  }

}
