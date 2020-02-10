Inn = class Inn extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 2) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Discard 2 cards:',
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Inn.discard_cards)
    } else if (_.size(player_cards.hand) === 0) {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

  gain_event(gainer) {
    let eligible_cards = _.filter(gainer.player_cards.discard, function(card) {
      return _.includes(_.words(card.types), 'action')
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of actions to shuffle into deck:',
        cards: eligible_cards,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(Inn.shuffle_actions)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but <strong>${gainer.player_cards.username}</strong> does not shuffle any actions into their deck`)
    }
  }

  static shuffle_actions(game, player_cards, selected_cards) {
    if (_.size(selected_cards) > 0) {
      let discard_actions = []
      _.each(selected_cards, function(selected_card) {
        let card_index = _.findIndex(player_cards.discard, function(discard_card) {
          return discard_card.name === selected_card.name
        })
        discard_actions.push(player_cards.discard.splice(card_index, 1)[0])
      })
      player_cards.deck = _.shuffle(player_cards.deck.concat(discard_actions))
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles ${CardView.render(discard_actions)} into thier deck`)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> does not shuffle any actions into their deck`)
    }
  }

}
