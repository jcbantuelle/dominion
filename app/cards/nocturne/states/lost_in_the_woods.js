LostInTheWoods = class LostInTheWoods extends State {

  start_turn_event(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Discard a card to receive a boon?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(LostInTheWoods.receive_boon)
  }

  static receive_boon(game, player_cards, response) {
    if (response === 'yes') {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to discard:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(LostInTheWoods.discard_card)
    }
  }

  static discard_card(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()

    PlayerCardsModel.update(game._id, player_cards)

    let boon_receiver = new EffectReceiver(game, player_cards, 'boon')
    boon_receiver.receive()
  }

}
