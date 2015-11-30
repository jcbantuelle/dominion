KingsCourt = class KingsCourt extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to play three times: (Or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(KingsCourt.play_thrice)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no action cards in hand`)
    }
  }

  static play_thrice(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let repeat_card_player = new RepeatCardPlayer(game, player_cards, selected_cards[0].name)
      repeat_card_player.play(3, 'Kings Court')
    }
  }

}
