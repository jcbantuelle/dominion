Disciple = class Disciple extends Traveller {

  types() {
     return ['action', 'traveller']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
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
        instructions: 'Choose a card to play two times: (Or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Disciple.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no action cards in hand`)
    }
  }

  static play_twice(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let card_player = new CardPlayer(game, player_cards, selected_card)
      card_player.play(true, true, 'hand', 2)

      let card_gainer = new CardGainer(game, player_cards, 'discard', selected_card.name)
      card_gainer.gain_game_card()
    }
  }

  discard_event(discarder, disciple) {
    this.choose_exchange(discarder.game, discarder.player_cards, disciple, 'Teacher')
  }

}
