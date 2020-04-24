ZombieApprentice = class ZombieApprentice extends Card {

  types() {
    return ['action', 'zombie']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'action')
    })
    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose an action to trash: (or none to skip)',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(ZombieApprentice.discard_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(3)

      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    }
  }

}
