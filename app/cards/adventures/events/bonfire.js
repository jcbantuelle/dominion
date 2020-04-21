Bonfire = class Bonfire extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    if (_.size(player_cards.in_play) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose up to 2 cards to trash:',
        cards: player_cards.in_play,
        minimum: 0,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Bonfire.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in play`)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'in_play', selected_cards)
      card_trasher.trash()
    }
  }
}
