HagglerProcessor = class HagglerProcessor {

  static process(game, player_cards, bought_card, haggler_count) {
    let coin_value = CostCalculator.calculate(game, player_cards, bought_card)
    let potion_value = bought_card.potion_cost()
    let eligible_cards = _.filter(game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(game, player_cards, card.top_card)
      return card.count > 0 && card.top_card.purchasable && ((coin_cost < coin_value && card.top_card.potion_cost <= potion_value) || (coin_cost === coin_value && card.top_card.potion_cost < potion_value))
    })
    _.times(haggler_count, () => {
      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEvents.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: `Choose a card to gain from ${CardView.card_html('action', 'Haggler')}:`,
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(HagglerProcessor.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.card_html('action', 'Haggler')}`)
      }
    })
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }
}
