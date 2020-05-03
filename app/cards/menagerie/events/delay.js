Delay = class Delay extends Event {

  coin_cost() {
    return 0
  }

  buy(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })

    var choice = []
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a action to set aside: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      choice = turn_event_processor.process(Delay.choose_card)
    }

    if (!_.isEmpty(choice)) {
      let delay = this.to_h()
      delay.target = choice[0]
      player_cards.start_turn_event_effects.push(delay)

      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.hand, player_cards.aside, choice[0])
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(choice[0])}`)  
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to set aside an action`)
    }
  }

  start_turn_event(game, player_cards, delay) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(delay)}`)
    let card_player = new CardPlayer(game, player_cards, delay.target)
    card_player.play(true, true, 'aside')
  }

  static choose_card(game, player_cards, selected_cards) {
    return selected_cards
  }
}
