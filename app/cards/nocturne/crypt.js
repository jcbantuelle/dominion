Crypt = class Crypt extends Duration {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let eligible_cards = _.filter(player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    let chosen_treasures = []
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
      chosen_treasures = turn_event_processor.process(Crypt.choose_treasures)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no treasures in play`)
    }

    if (!_.isEmpty(chosen_treasures)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${CardView.render(chosen_treasures)}`)
      _.each(chosen_treasures, (treasure) => {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.in_play, player_cards.crypt, treasure)
      })

      let crypt_effect = _.clone(card_player.card)
      crypt_effect.crypt_cards = _.clone(chosen_treasures)

      player_cards.duration_effects.push(crypt_effect)
      return 'duration'
    }
  }

  static choose_treasures(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      return selected_cards
    } else {
      game.log.push(`&nbsp;&nbsp;but does not set aside any treasures`)
      return []
    }
  }

  duration(game, player_cards, crypt) {
    if (_.size(crypt.crypt_cards) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put in hand:',
        cards: crypt.crypt_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, crypt)
      turn_event_processor.process(Crypt.put_card_in_hand)
    } else {
      Crypt.put_card_in_hand(game, player_cards, crypt.crypt_cards, crypt)
    }
  }

  static put_card_in_hand(game, player_cards, selected_cards, crypt) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.crypt, player_cards.hand, selected_cards[0])
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a set aside card in hand from ${CardView.render(crypt)}`)

    let aside_card_index = _.findIndex(crypt.crypt_cards, function(card) {
      return selected_cards[0].id === card.id
    })
    crypt.crypt_cards.splice(aside_card_index, 1)
    if (_.size(crypt.crypt_cards) > 0) {
      player_cards.duration_effects.push(crypt)
    }
  }

}
