Haggler = class Haggler extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
  }

  buy_event(buyer) {
    let all_player_cards = PlayerCards.find({
      game_id: buyer.game._id
    }).fetch()

    let coin_value = CostCalculator.calculate(buyer.game, buyer.card, all_player_cards)
    let potion_value = buyer.card.potion_cost()
    let eligible_cards = _.filter(buyer.game.cards, function(card) {
      let coin_cost = CostCalculator.calculate(buyer.game, card.top_card, all_player_cards)
      return card.count > 0 && card.top_card.purchasable && ((coin_cost < coin_value && card.top_card.potion_cost <= potion_value) || (coin_cost === coin_value && card.top_card.potion_cost < potion_value))
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: `Choose a card to gain from ${CardView.render(this)}:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Haggler.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain from ${CardView.render(this)}`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
    card_gainer.gain_game_card()
  }

}
