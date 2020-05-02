Invest = class Invest extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, (card) => {
        return card.count > 0 && card.supply && _.includes(_.words(card.top_card.types), 'action')
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          game_cards: true,
          instructions: 'Choose an action to exile:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        let card_to_exile = turn_event_processor.process(Invest.exile_card)
      } else if (_.size(eligible_cards) === 1) {
        Invest.exile_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no actions to exile`)
      }
  }

  gain_event(gainer, invest, player_cards) {
    Invest.draw_investment_cards(gainer.game, player_cards, gainer.gained_card)
  }

  static exile_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0].top_card
    player_cards.investments.push(selected_card)
    let supply_card_exiler = new SupplyCardExiler(game, player_cards, selected_card.stack_name, selected_card)
    supply_card_exiler.exile()

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (next_player_cards) => {
      Invest.draw_investment_cards(game, next_player_cards, selected_card)
    })
  }

  static draw_investment_cards(game, player_cards, card) {
    let investments = _.filter(player_cards.investments, (investment) => {
      return investment.name === card.name
    })
    if (_.size(investments) > 0) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(investments)*2)  
      PlayerCardsModel.update(game._id, player_cards)
    }
  }

}
