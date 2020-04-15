Diplomat = class Diplomat extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    if (_.size(player_cards.hand) < 6) {
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(2)
    }
  }

  attack_event(game, player_cards, diplomat) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand', diplomat)

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    if (_.size(player_cards.hand) > 3) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose 3 cards to discard from hand:`,
        cards: player_cards.hand,
        minimum: 3,
        maximum: 3
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Diplomat.discard_from_hand)
    } else {
      Diplomat.discard_from_hand(game, player_cards, player_cards.hand)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

}
