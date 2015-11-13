SpiceMerchant = class SpiceMerchant extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
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
        instructions: 'Choose a card to trash (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SpiceMerchant.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card.name)
      card_trasher.trash()

      let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+2 cards and +1 action', value: 'cards'},
        {text: '+$2 and +1 buy', value: 'coins'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(SpiceMerchant.process_response)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)

      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    } else if (response === 'coins') {
      game.turn.buys += 1
      game.turn.coins += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$2`)
    }
  }

}
