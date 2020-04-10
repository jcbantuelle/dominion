Transmute = class Transmute extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Transmute.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()

    let trashed_card = selected_cards[0]
    let selected_card_types = _.words(trashed_card.types)

    if (_.includes(selected_card_types, 'action')) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchy')
      card_gainer.gain_game_card()
    }

    if (_.includes(selected_card_types, 'treasure')) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Transmute')
      card_gainer.gain_game_card()
    }

    if (_.includes(selected_card_types, 'victory')) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain_game_card()
    }
  }

}
