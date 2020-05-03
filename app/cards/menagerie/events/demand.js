Demand = class Demand extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    let horse = _.find(game.cards, (card) => {
      return card.count > 0 && card.name === 'Horse'
    })

    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && CardCostComparer.coin_less_than(game, card.top_card, 5)
    })

    var chosen_card
    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      chosen_card = turn_event_processor.process(Demand.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      chosen_card = eliglble_cards[0]
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards costing up to $4 to gain`)
    }

    if (horse && chosen_card) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to gain cards on deck: (leftmost will be top card)',
        cards: [horse.top_card, chosen_card.top_card]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let ordered_cards = turn_event_processor.process(Demand.choose_order)

      _.each(ordered_cards.reverse(), function(ordered_card) {
        let card_gainer = new CardGainer(game, player_cards, 'deck', ordered_card.name)
        card_gainer.gain()
      })
    } else if (horse) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
      card_gainer.gain()
    } else if (chosen_card) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', chosen_card.name)
      card_gainer.gain()
    } else {
      game.log.push(`&nbsp;&nbsp;and there is no ${CardView.render(new Horse())} to gain`) 
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    return selected_cards[0]
  }

  static choose_order(game, player_cards, selected_cards) {
    return selected_cards
  }

}
