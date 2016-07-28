Crown = class Crown extends Card {

  types() {
    return ['action', 'treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), game.turn.phase)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play twice (or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Crown.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no ${game.turn.phase} cards in hand`)
    }
  }

  static play_twice(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let selected_card = selected_cards[0]

      let repeat_card_player = new RepeatCardPlayer(game, player_cards, selected_card.name)
      repeat_card_player.play(2, 'Crown')
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play anything`)
    }
  }

}
