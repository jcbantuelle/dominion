TheSkysGift = class TheSkysGift extends Boon {

  receive(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Discard 3 Cards?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(TheSkysGift.choose_discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static choose_discard(game, player_cards, response) {
    if (response === 'yes') {
      if (_.size(player_cards.hand) > 3) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 3 cards to discard:',
          cards: player_cards.hand,
          minimum: 3,
          maximum: 3
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(TheSkysGift.discard_cards)
      } else {
        TheSkysGift.discard_cards(game, player_cards, player_cards.hand)
      }
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let discarded_card_count = _.size(selected_cards)

    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()

    if (discarded_card_count === 3) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain()
    }
  }

}
