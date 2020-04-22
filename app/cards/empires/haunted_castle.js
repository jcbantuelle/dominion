HauntedCastle = class HauntedCastle extends Castles {

  coin_cost() {
    return 6
  }

  victory_points(player_cards) {
    return 2
  }

  gain_event(gainer) {
    let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Gold')
    card_gainer.gain()

    GameModel.update(gainer.game._id, gainer.game)
    PlayerCardsModel.update(gainer.game._id, gainer.player_cards)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(gainer.game, gainer.player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (other_player_cards) => {
      this.return_cards(gainer.game, other_player_cards)
      PlayerCardsModel.update(gainer.game._id, other_player_cards)
    })
  }

  return_cards(game, player_cards) {
    if (_.size(player_cards.hand) >= 5) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose 2 cards to put on top of your deck:`,
        cards: player_cards.hand,
        minimum: 2,
        maximum: 2
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(HauntedCastle.return_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.hand, selected_cards)
  }

}
