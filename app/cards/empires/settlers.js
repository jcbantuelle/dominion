Settlers = class Settlers extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  stack_name() {
    return 'Settlers/Bustling Village'
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let copper_index = _.findIndex(player_cards.discard, function(card) {
      return card.inherited_name === 'Copper'
    })
    if (copper_index != -1) {
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Reveal ${CardView.render(player_cards.discard[copper_index])}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, copper_index)
      turn_event_processor.process(Settlers.reveal_copper)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(new Copper())}`)
    }
  }

  static reveal_copper(game, player_cards, response, copper_index) {
    if (response === 'yes') {
      copper = player_cards.discard.splice(copper_index, 1)[0]
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(copper)}`)
      player_cards.hand.push(copper)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not reveal a ${CardView.render(player_cards.discard[copper_index])}`)
    }
  }

}
