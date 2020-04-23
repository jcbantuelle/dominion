Arena = class Arena extends Landmark {

  start_buy_event(game, player_cards, arena) {
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
        instructions: `Choose an action card to discard for ${CardView.render(arena)} (or none to skip):`,
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, arena)
      turn_event_processor.process(Arena.discard_card)
    }
  }

  static discard_card(game, player_cards, selected_cards, arena) {
    if (_.size(selected_cards) > 0) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let arena_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Arena'
      })
      if (arena_stack.victory_tokens > 0) {
        let victory_tokens = Math.min(2, arena_stack.victory_tokens)
        arena_stack.victory_tokens = arena_stack.victory_tokens - victory_tokens

        let victory_token_gainer = new VictoryTokenGainer(game, player_cards, arena)
        victory_token_gainer.gain(victory_tokens)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no tokens to gain from ${CardView.render(arena)}`)
      }
    }
  }

}
