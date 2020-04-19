Count = class Count extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Discard 2 cards', value: 'discard'},
        {text: 'Put a card on your deck', value: 'deck'},
        {text: 'Gain a copper', value: 'copper'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Count.process_response)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$3', value: 'coin'},
        {text: 'Trash your hand', value: 'trash'},
        {text: 'Gain a duchy', value: 'duchy'}
      ]
    })
    turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Count.process_response)
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'discard') {
      if (_.size(player_cards.hand) > 2) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 2 cards to discard:',
          cards: player_cards.hand,
          minimum: 2,
          maximum: 2
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Count.discard_cards)
      } else if (_.size(player_cards.hand) > 0) {
        Count.discard_cards(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to discard 2 cards, but has no cards in their hand`)
      }
    } else if (response[0] === 'deck') {
      if (_.size(player_cards.hand) > 1) {
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
        turn_event_processor.process(Count.return_to_deck)
      } else if (_.size(player_cards.hand) > 0) {
        Count.return_to_deck(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to put a card on their deck, but has no cards in their hand`)
      }
    } else if (response[0] === 'copper') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
      card_gainer.gain()
    } else if (response[0] === 'coin') {
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(3)
    } else if (response[0] === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'hand')
      card_trasher.trash()
    } else if (response[0] === 'duchy') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchy')
      card_gainer.gain()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.hand, selected_cards)
  }

}
