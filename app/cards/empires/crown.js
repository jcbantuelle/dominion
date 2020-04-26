Crown = class Crown extends Card {

  types() {
    return ['action', 'treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Crown.play_twice)
    } else {
      let article_text = game.turn.phase === 'action' ? 'an' : 'a'
      game.log.push(`&nbsp;&nbsp;but does not play ${article_text} ${game.turn.phase}`)
    }
  }

  static play_twice(game, player_cards, selected_cards, crown) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0], crown)
      card_player.play(true, true, 'hand', 2)
    } else {
      let article_text = game.turn.phase === 'action' ? 'an' : 'a'
      game.log.push(`&nbsp;&nbsp;but does not play ${article_text} ${game.turn.phase}`)
    }
  }

}
