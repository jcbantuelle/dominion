Chapel = class Chapel extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 4 cards to trash:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 4,
        finished: false
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(this.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      Games.update(game._id, game)
    }
  }

  trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      _.each(selected_cards, function(card) {
        let card_trasher = new CardTrasher(game, player_cards.username, player_cards.hand, card.name)
        card_trasher.trash()
      })
    }
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
