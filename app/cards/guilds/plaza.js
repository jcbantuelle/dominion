Plaza = class Plaza extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })
    if (_.size(eligible_cards) > 0) {
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a treasure to discard (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Plaza.discard_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let selected_card = selected_cards[0]

      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_card.name)
      card_discarder.discard()

      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.coin_tokens += 1
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> takes a coin token`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.coin_tokens += 1
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes a coin token`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    }
  }

}
