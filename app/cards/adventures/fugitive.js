Fugitive = class Fugitive extends Traveller {

  types() {
     return ['action', 'traveller']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to discard from hand:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Fugitive.discard_from_hand)
    } else if (_.size(player_cards.hand === 1)) {
      Fugitive.discard_from_hand(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static discard_from_hand(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  discard_event(discarder, fugitive) {
    this.choose_exchange(discarder.game, discarder.player_cards, fugitive, 'Disciple')
  }

}
