University = class University extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, card.top_card)
      return card.count > 0 && card.top_card.purchasable && coin_cost <= 5 && card.top_card.potion_cost === 0 && _.contains(card.top_card.types, 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(University.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
      card_gainer.gain_game_card()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to gain a card`)
    }
  }

}
