Arena = class Arena extends Landmark {

  start_buy_event(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose an action card to discard for ${CardView.render(this)} (or none to skip):`,
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, this)
      turn_event_processor.process(Arena.discard_card)
    }
  }

  static discard_card(game, player_cards, selected_cards, arena) {
    if (_.size(selected_cards) > 0) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_discarder.discard()

      let arena_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Arena'
      })
      if (arena_stack.victory_tokens > 0) {
        let victory_tokens = Math.min(2, arena_stack.victory_tokens)
        arena_stack.victory_tokens = Math.max(0, arena_stack.victory_tokens - 2)

        if (game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
          possessing_player_cards.victory_tokens += victory_tokens
          game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(arena)}`)
          PlayerCardsModel.update(game._id, possessing_player_cards)
        } else {
          player_cards.victory_tokens += victory_tokens
          game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(arena)}`)
        }
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no tokens to gain from ${CardView.render(arena)}`)
      }
    }
  }

}
