Haven = class Haven extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
      let haven_effect = this.to_h()
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to set aside:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, haven_effect)
      turn_event_processor.process(Haven.set_aside_card)
      return 'duration'
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static set_aside_card(game, player_cards, selected_cards, haven_effect) {
    let selected_card = selected_cards[0]

    let card_index = _.findIndex(player_cards.hand, function(card) {
      return selected_card.id === card.id
    })
    let set_aside_card = player_cards.hand.splice(card_index, 1)[0]

    haven_effect.haven = set_aside_card
    player_cards.duration_effects.push(haven_effect)

    player_cards.haven.push(set_aside_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside a card`)
  }

  duration(game, player_cards, duration_card) {
    let set_aside_card_index = _.findIndex(player_cards.haven, function(card) {
      return duration_card.haven.id === card.id
    })
    let set_aside_card = player_cards.haven.splice(set_aside_card_index, 1)[0]
    player_cards.hand.push(set_aside_card)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their set aside card in hand from ${CardView.render(duration_card)}`)
  }

}
