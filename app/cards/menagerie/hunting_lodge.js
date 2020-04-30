HuntingLodge = class HuntingLodge extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Discard Hand?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let response = turn_event_processor.process(HuntingLodge.discard_hand)

    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()

      card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(5)
    }
  }

  static discard_hand(game, player_cards, response) {
    return response
  }

}
