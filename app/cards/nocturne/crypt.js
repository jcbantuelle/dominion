Crypt = class Crypt extends Card {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of treasures to set aside:',
        cards: eligible_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Crypt.set_aside)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no treasures in play`)
    }

    if (_.isEmpty(game.turn.crypt_cards)) {
      game.log.push(`&nbsp;&nbsp;but does not set aside any treasures`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(game.turn.crypt_cards)}`)
      player_cards.crypt = player_cards.crypt.concat(game.turn.crypt_cards)
      let crypt_effect = this.to_h()
      crypt_effect.set_aside_cards = game.turn.crypt_cards
      player_cards.duration_effects.push(crypt_effect)
      delete game.turn.crypt_cards
      return 'duration'
    }
  }

  static set_aside(game, player_cards, selected_cards) {
    game.turn.crypt_cards = []
    _.each(selected_cards, function(selected_card) {
      let card_index = _.findIndex(player_cards.in_play, (in_play_card) => {
        return selected_card.name === in_play_card.name
      })
      if (card_index !== -1) {
        game.turn.crypt_cards.push(player_cards.in_play.splice(card_index, 1)[0])
      }
    })
  }

  duration(game, player_cards, duration_card) {
    if (_.size(duration_card.set_aside_cards) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to put in hand:',
        cards: duration_card.set_aside_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, duration_card)
      turn_event_processor.process(Crypt.put_card_in_hand)
    } else {
      Crypt.put_card_in_hand(game, player_cards, duration_card.set_aside_cards, duration_card)
    }
  }

  static put_card_in_hand(game, player_cards, selected_card, duration_card) {
    selected_card = selected_card[0]
    let selected_card_index = _.findIndex(player_cards.crypt, function(card) {
      return selected_card.name === card.name
    })
    player_cards.hand.push(player_cards.crypt.splice(selected_card_index, 1)[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a set aside card in hand from ${CardView.card_html('duration night', 'Crypt')}`)

    let duration_card_index = _.findIndex(duration_card.set_aside_cards, function(card) {
      return selected_card.name === card.name
    })
    duration_card.set_aside_cards.splice(duration_card_index, 1)
    if (_.size(duration_card.set_aside_cards) > 0) {
      player_cards.duration_effects.push(duration_card)
    }
  }

}
