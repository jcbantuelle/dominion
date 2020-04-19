Church = class Church extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    GameModel.update(game._id, game)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 3 cards to set aside:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card_player)
      turn_event_processor.process(Church.set_aside_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    return 'duration'
  }

  static set_aside_cards(game, player_cards, selected_cards, card_player) {
    if (!_.isEmpty(selected_cards)) {
      let church_effect = _.clone(card_player.card)
      _.each(selected_cards, (card) => {
        let card_mover = new CardMover(game, player_cards)
        card_mover.move(player_cards.hand, player_cards.church, card)
      })
      church_effect.church_cards = selected_cards
      player_cards.duration_effects.push(church_effect)
      let card_text = _.size(selected_cards) === 1 ? 'card' : 'cards'
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> sets aside ${_.size(selected_cards)} ${card_text}`)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to set aside any cards`)
    }
  }

  duration(game, player_cards, church) {
    _.each(church.church_cards, (card) => {
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.church, player_cards.hand, card)
    })
    let card_text = _.size(church.church_cards) === 1 ? 'card' : 'cards'
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${_.size(church.church_cards)} ${card_text} in hand from ${CardView.render(church)}`)

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (or none to skip):',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Church.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand to trash for ${CardView.render(church)}`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to trash a card`)
    }
  }

}
