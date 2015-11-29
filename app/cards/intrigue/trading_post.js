TradingPost = class TradingPost extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 2) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose 2 cards to trash:',
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(TradingPost.trash_cards)
    } else {
      TradingPost.trash_cards(game, player_cards, player_cards.hand)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    let trashed_card_count = _.size(selected_cards)
    if (trashed_card_count === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand to trash`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_trasher.trash()
    }

    if (trashed_card_count === 2) {
      let card_gainer = new CardGainer(game, player_cards, 'hand', 'Silver')
      card_gainer.gain_game_card()
    }
  }

}
