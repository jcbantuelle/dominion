Save = class Save extends Event {

  coin_cost() {
    return 1
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    if (_.size(player_cards.hand) > 1) {
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Save.set_aside_card)
    } else if (_.size(player_cards.hand) === 1) {
      Save.set_aside_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static set_aside_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]

    let card_index = _.findIndex(player_cards.hand, function(card) {
      return selected_card.name === card.name
    })
    let set_aside_card = player_cards.hand.splice(card_index, 1)[0]

    player_cards.save.push(set_aside_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside a card`)
  }
}
