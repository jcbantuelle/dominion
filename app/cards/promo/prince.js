Prince = class Prince extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 8
  }

  play(game, player_cards, card_player) {
    let prince = _.find(player_cards.in_play, (card) => {
      return card.id === card_player.card.id
    })
    if (prince) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Set aside Prince?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player.card)
      turn_event_processor.process(Prince.set_aside_prince)
    } else {
      game.log.push(`&nbsp;&nbsp;but ${CardView.render(card_player.card)} is not in play`)
    }
  }

  start_turn_event(game, player_cards, prince) {
    let target = _.find(player_cards.aside, (card) => {
      return card.id === prince.target.id
    })
    if (target) {
      let card_player = new CardPlayer(game, player_cards, target)
      card_player.play(true, true, 'aside')
    }
  }

  discard_event(discarder, prince) {
    let card_mover = new CardMover(discarder.game, discarder.player_cards)
    if (card_mover.move(discarder.player_cards.in_play, discarder.player_cards.aside, prince.target)) {
      discarder.game.log.push(`<strong>${discarder.player_cards.username}</strong> sets ${CardView.render(prince.target)} aside`)
    }
  }

  static unset_prince_tracking(game, player_cards) {
    let princes = _.filter(player_cards.aside, (card) => {
      let played_action = _.find(game.turn.played_actions, (action) => {
        return action.id === card.id
      })
      return card.name === 'Prince' && card.target && !played_action
    })
    _.each(princes, (prince) => {
      let target = _.find(player_cards.aside, (card) => {
        return card.id === prince.target.id
      })
      if (!target) {
        game.log.push(`<strong>${player_cards.username}</strong> attempts to set ${CardView.render(prince.target)} aside but it did not discard from play`)
        delete prince.target
      }
    })
  }

  static set_aside_prince(game, player_cards, response, prince) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.move(player_cards.in_play, player_cards.aside, prince)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(prince)}`)

        let eligible_cards = _.filter(player_cards.hand, function(card) {
          return _.includes(_.words(card.types), 'action') && CardCostComparer.coin_less_than(game, card, 5)
        })
        if (_.size(eligible_cards) > 1) {
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
          let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, prince)
          turn_event_processor.process(Prince.set_aside_action)
        } else if (_.size(eligible_cards) === 1) {
          Prince.set_aside_action(game, player_cards, eligible_cards, prince)
        } else {
          game.log.push(`&nbsp;&nbsp;but there are no eligible actions in hand`)
        }
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to set it aside`)
    }
  }

  static set_aside_action(game, player_cards, selected_cards, prince) {
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.hand, player_cards.aside, selected_cards[0])) {
      let prince_index = _.findIndex(player_cards.aside, (card) => {
        return card.id === prince.id
      })
      player_cards.aside[prince_index].target = selected_cards[0]
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(selected_cards[0])}`)
    }
  }

}
