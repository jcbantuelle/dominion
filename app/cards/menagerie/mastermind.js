Mastermind = class Mastermind extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, mastermind) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(mastermind)}`)
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
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      let choice = turn_event_processor.process(Mastermind.play_thrice)
      if (!_.isEmpty(choice)) {
        let card_player = new CardPlayer(game, player_cards, choice[0], mastermind)
        card_player.play(true, true, 'hand', 3)
      } else {
        game.log.push(`&nbsp;&nbsp;but does not play an action`)  
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not play an action`)
    }
  }

  static play_thrice(game, player_cards, selected_cards) {
    return selected_cards
  }

}
