Cemetery = class Cemetery extends Card {

  types() {
    return ['victory']
  }

  coin_cost() {
    return 4
  }

  victory_points() {
    return 2
  }

  gain_event(gainer) {
    if (_.size(gainer.player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: gainer.game._id,
        player_id: gainer.player_cards.player_id,
        username: gainer.player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 4 cards to trash:',
        cards: gainer.player_cards.hand,
        minimum: 0,
        maximum: 4
      })
      let turn_event_processor = new TurnEventProcessor(gainer.game, gainer.player_cards, turn_event_id)
      turn_event_processor.process(Cemetery.trash_cards)
    } else {
      gainer.game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

}
