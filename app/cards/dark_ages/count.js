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
    turn_event_processor.process(Count.process_first_response)

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
    turn_event_processor.process(Count.process_second_response)
  }

  static process_first_response(game, player_cards, response) {
    response = response[0]
    if (response === 'discard') {
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
    } else if (response === 'deck') {
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
    } else if (response === 'copper') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Copper')
      card_gainer.gain_game_card()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let returned_card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_cards[0].name
    })
    let returned_card = player_cards.hand.splice(returned_card_index, 1)[0]
    player_cards.deck.unshift(returned_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places a card on their deck`)
  }

  static process_second_response(game, player_cards, response) {
    response = response[0]
    if (response === 'coin') {
      let gained_coins = CoinGainer.gain(game, player_cards, 3)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    } else if (response === 'trash') {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(player_cards.hand, 'name'))
      card_trasher.trash()
    } else if (response === 'duchy') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Duchy')
      card_gainer.gain_game_card()
    }
  }

}
