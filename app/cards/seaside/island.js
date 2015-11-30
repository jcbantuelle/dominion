Island = class Island extends Card {

  types() {
    return ['action', 'victory']
  }

  coin_cost() {
    return 4
  }

  victory_points() {
    return 2
  }

  play(game, player_cards) {
    let island_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === 'Island'
    })
    if (island_index !== -1) {
      player_cards.island = player_cards.island.concat(player_cards.playing.splice(island_index, 1))
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(this)}`)
    }

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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Island.set_aside_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no other cards in hand`)
    }
  }

  static set_aside_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]

    let card_index = _.findIndex(player_cards.hand, function(card) {
      return selected_card.name === card.name
    })

    player_cards.island = player_cards.island.concat(player_cards.hand.splice(card_index, 1))
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(selected_card)}`)
  }

}
