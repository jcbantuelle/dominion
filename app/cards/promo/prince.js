Prince = class Prince extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 8
  }

  play(game, player_cards) {
    let prince_index = _.findIndex(player_cards.playing, function(card) {
      return card.name === 'Prince'
    })
    if (prince_index !== -1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Set aside Prince?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, prince_index)
      turn_event_processor.process(Prince.set_aside_prince)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(this)} is not in play`)
    }
  }

  static set_aside_prince(game, player_cards, response, prince_index) {
    if (response === 'yes') {
      let prince = player_cards.playing.splice(prince_index, 1)[0]
      player_cards.prince.push(prince)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(prince)}`)

      let eligible_cards = _.filter(player_cards.hand, function(card) {
        return _.includes(_.words(card.types), 'action') && CardCostComparer.coin_less_than(game, card, 5)
      })

      if (_.size(eligible_cards) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to set aside:',
          cards: eligible_cards,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Prince.set_aside_action)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no eligible actions in hand`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to set it aside`)
    }
  }

  static set_aside_action(game, player_cards, selected_cards) {
    let action = selected_cards[0]

    let card_index = _.findIndex(player_cards.hand, function(card) {
      return action.name === card.name
    })

    player_cards.princed.push(player_cards.hand.splice(card_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(action)}`)
  }

}
