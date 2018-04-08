Fear = class Fear extends Hex {

  receive(game, player_cards) {
    if (_.size(player_cards.hand) > 4) {
      let eligible_cards = _.filter(player_cards.hand, function(card) {
        return _.includes(_.words(card.types), 'treasure') || _.includes(_.words(card.types), 'action')
      })

      if (_.size(eligible_cards) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to discard:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Fear.discard_card)
      } else if (_.size(eligible_cards) === 1) {
        Fear.discard_card(game, player_cards, eligible_cards)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

}
