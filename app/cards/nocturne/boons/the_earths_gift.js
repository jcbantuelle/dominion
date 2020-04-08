TheEarthsGift = class TheEarthsGift extends Boon {

  receive(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to discard (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(TheEarthsGift.discard_treasure)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard a treasure`)
    }
  }

  static discard_treasure(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      discard_treasure = selected_cards[0]

      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let eligible_cards = _.filter(game.cards, function(card) {
        return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 5)
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
        turn_event_processor.process(TheEarthsGift.gain_card)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard a treasure`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
    card_gainer.gain_game_card()
  }

}
