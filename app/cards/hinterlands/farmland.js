Farmland = class Farmland extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 6
  }

  victory_points() {
    return 2
  }

  buy_event(buyer) {
    if (_.size(buyer.player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: buyer.player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Farmland.trash_card)
    } else {
      buyer.game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]

    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_card)
    card_trasher.trash()

    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.card_equal_to(game, selected_card, card.top_card, 2)
    })

    if (_.size(eligible_cards) > 0) {
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
      turn_event_processor.process(Farmland.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

}
