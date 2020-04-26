CropRotation = class CropRotation extends Project {

  coin_cost() {
    return 6
  }

  start_turn_event(game, player_cards, crop_rotation) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(crop_rotation)}`)

    let eligible_cards = _.filter(player_cards.hand, (card) => {
      return _.includes(_.words(card.types), 'victory')
    })

    if (_.size(eligible_cards) > 0) {
      GameModel.update(game._id, game)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to discard: (or none to skip)`,
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(CropRotation.discard_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to discard a victory card`)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
      card_discarder.discard()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)
    } else {
      game.log.push(`&nbsp;&nbsp;but chooses not to discard a victory card`)
    }
  }

}
