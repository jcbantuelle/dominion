Haven = class Haven extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Haven.set_aside_card)
      return 'duration'
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static set_aside_card(game, player_cards, selected_cards, card_player) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.haven, selected_cards[0])

    let haven_effect = _.clone(card_player.card)
    haven_effect.haven_card = selected_cards[0]
    player_cards.duration_effects.push(haven_effect)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside a card`)
  }

  duration(game, player_cards, haven) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.haven, player_cards.hand, haven.haven_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their set aside card in hand from ${CardView.render(haven)}`)
  }

}
