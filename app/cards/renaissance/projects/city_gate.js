CityGate = class CityGate extends Project {

  coin_cost() {
    return 3
  }

  start_turn_event(game, player_cards, city_gate) {
    let card_drawer = new CardDrawer(game, player_cards, city_gate)
    card_drawer.draw(1)

    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to put on top of your deck:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(CityGate.return_to_deck)
    } else if (_.size(player_cards.hand) === 1) {
      CityGate.return_to_deck(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but <strong>${player_cards.username}</strong> has no cards in thier hand`)
    }
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.hand, selected_cards)
  }

}
