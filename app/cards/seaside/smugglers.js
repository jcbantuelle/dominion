Smugglers = class Smugglers extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let previous_player_query = new PreviousPlayerQuery(game, player_cards.player_id)
    let previous_player_cards = PlayerCardsModel.findOne(game._id, previous_player_query.previous_player()._id)

    let eligible_cards = _.filter(previous_player_cards.last_turn_gained_cards, function(gained_card) {
      return _.find(game.cards, function(stack) {
        return stack.name === gained_card.stack_name && stack.supply && gained_card.name === stack.top_card.name && CardCostComparer.coin_less_than(game, stack.top_card, 7)
      })
    })

    if (_.size(eligible_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Smugglers.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Smugglers.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
