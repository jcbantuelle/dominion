Tax = class Tax extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.supply
    })

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_cards',
      game_cards: true,
      instructions: 'Choose a card to tax:',
      cards: eligible_cards,
      minimum: 0,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Tax.add_debt)
  }

  buy_event(buyer, tax) {
    let debt_token_gainer = new DebtTokenGainer(buyer.game, buyer.player_cards, tax)
    debt_token_gainer.gain(buyer.game_card.debt_tokens)
    buyer.game_card.debt_tokens = 0
  }

  static add_debt(game, player_cards, selected_cards) {
    let taxed_pile = _.find(game.cards, (card) => {
      return card.name === selected_cards[0].name
    })
    taxed_pile.debt_tokens += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> adds two debt tokens to ${CardView.render(selected_cards)}`)
  }

}
