Goat = class Goat extends Card {

  types() {
    return ['treasure', 'heirloom']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (Or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Goat.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

}
