Tax = class Tax extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.top_card.purchasable
    })

    let turn_event_id = TurnEventModel.insert({
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
    turn_event_processor.process(Tax.add_debt)
  }

  static add_debt(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let supply_index = _.findIndex(game.cards, (card) => {
      return card.name === selected_card.name
    })
    game.cards[supply_index].debt_tokens += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> adds two debt tokens to ${CardView.render(selected_card)}`)
  }

}
