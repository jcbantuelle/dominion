Bargain = class Bargain extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && !_.includes(_.words(card.top_card.types), 'victory') && CardCostComparer.coin_less_than(game, card.top_card, 6)
    })

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
      turn_event_processor.process(Bargain.gain_card)
    } else if (_.size(eligible_cards) === 1) {
      Bargain.gain_card(game, player_cards, eligible_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (next_player_cards) => {
      let card_gainer = new CardGainer(game, next_player_cards, 'discard', 'Horse')
      card_gainer.gain()
      PlayerCardsModel.update(game._id, next_player_cards)
    })
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain()
  }

}
