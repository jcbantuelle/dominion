KingsCourt = class KingsCourt extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play three times: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(KingsCourt.play_thrice)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static play_thrice(game, player_cards, selected_cards, kings_court) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0], kings_court)
      card_player.play(true, true, 'hand', 3)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

}
