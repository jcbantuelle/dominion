BustlingVillage = class BustlingVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  stack_name() {
    return 'Settlers/Bustling Village'
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 3
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +3 actions`)

    let settlers_index = _.findIndex(player_cards.discard, function(card) {
      return card.inherited_name === 'Settlers'
    })
    if (settlers_index != -1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(player_cards.discard[settlers_index])}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, settlers_index)
      turn_event_processor.process(BustlingVillage.reveal_settlers)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(new Settlers())}`)
    }
  }

  static reveal_settlers(game, player_cards, response, settlers_index) {
    if (response === 'yes') {
      settlers = player_cards.discard.splice(settlers_index, 1)[0]
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(settlers)}`)
      player_cards.hand.push(settlers)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(player_cards.discard[settlers_index])}`)
    }
  }

}
