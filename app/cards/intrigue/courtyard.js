Courtyard = class Courtyard extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(3)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on deck:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, player_cards.hand)
      return turn_event_processor.process(CardReturner.return_ordered_cards_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

}
