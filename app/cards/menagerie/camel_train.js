CamelTrain = class CamelTrain extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.supply && !_.includes(_.words(card.top_card.types), 'victory')
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to exile:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(CamelTrain.exile_card)
    } else if (_.size(eligible_cards) === 1) {
      CamelTrain.exile_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no non-victory cards to exile`)
    }
  }

  gain_event(gainer, camel_train) {
    let gold = _.find(gainer.game.cards, (card) => {
      return card.name === 'Gold'
    })
    let supply_card_exiler = new SupplyCardExiler(gainer.game, gainer.player_cards, gold.stack_name, gold.top_card)
    supply_card_exiler.exile()
  }

  static exile_card(game, player_cards, selected_cards) {
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, selected_cards[0].stack_name, selected_cards[0].top_card)
    supply_card_exiler.exile()
  }

}
