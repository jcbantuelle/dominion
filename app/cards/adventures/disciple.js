Disciple = class Disciple extends Traveller {

  types() {
     return ['action', 'traveller']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
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
        instructions: 'Choose a card to play two times: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Disciple.play_twice)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play an action`)
    }
  }

  static play_twice(game, player_cards, selected_cards, disciple) {
    if (!_.isEmpty(selected_cards)) {
      let card_player = new CardPlayer(game, player_cards, selected_cards[0], disciple)
      card_player.play(true, true, 'hand', 2)

      let played_card = _.find(game.cards, (card) => {
        return card.supply && card.stack_name === selected_cards[0].stack_name
      })
      let gained_card = false
      if (played_card) {
        let card_gainer = new CardGainer(game, player_cards, 'discard', selected_cards[0].name)
         gained_card = card_gainer.gain()
      }
      if (!played_card || !gained_card) {
        game.log.push(`&nbsp;&nbsp;but can not gain a copy of ${CardView.render(selected_cards)}`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to play an action`)
    }
  }

  discard_event(discarder, disciple) {
    this.choose_exchange(discarder.game, discarder.player_cards, disciple, 'Teacher')
  }

}
