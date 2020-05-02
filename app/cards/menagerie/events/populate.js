Populate = class Populate extends Event {

  coin_cost() {
    return 10
  }

  buy(game, player_cards) {
    let ordered_cards = _.filter(game.cards, (card) => {
      return card.count > 0 && card.supply && _.includes(_.words(card.top_card.pile_types), 'action')
    })
    ordered_cards = _.map(ordered_cards, 'top_card')

    if (_.size(ordered_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to gain cards:',
        cards: ordered_cards
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      ordered_cards = turn_event_processor.process(Populate.choose_order)
    }

    _.each(ordered_cards, (card) => {
      let card_gainer = new CardGainer(game, player_cards, 'discard', card.name)
      card_gainer.gain()  
    })
  }

  static choose_order(game, player_cards, ordered_cards) {
    return ordered_cards
  }

}
