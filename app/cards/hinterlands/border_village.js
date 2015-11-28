BorderVillage = class BorderVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

  gain_event(gainer) {
    let all_player_cards = PlayerCards.find({
      game_id: gainer.game._id
    }).fetch()

    let coin_value = CostCalculator.calculate(gainer.game, this, all_player_cards)
    let eligible_cards = _.filter(gainer.game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(gainer.game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && coin_cost < coin_value && card.top_card.potion_cost === 0
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(BorderVillage.gain_card)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

}
