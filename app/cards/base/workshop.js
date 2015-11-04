Workshop = class Workshop extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.kingdom_cards.concat(game.common_cards), function(card) {
      return card.count > 0 && card.top_card.purchasable && card.top_card.coin_cost <= 4 && card.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
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
      turn_event_processor.process(Workshop.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, selected_card.name)
    card_gainer[`gain_${selected_card.source}_card`]()
  }

}
