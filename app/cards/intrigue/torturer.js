Torturer = class Torturer extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
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
        {text: 'Gain a curse in hand', value: 'curse'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Torturer.process_response)
  }

  static process_response(game, player_cards, response) {
    response = response[0]
    if (response === 'discard') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to discard 2 cards`)
      let hand_size = _.size(player_cards.hand)
      if (hand_size > 2) {
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
        turn_event_processor.process(Torturer.discard_cards)
      } else {
        Torturer.discard_cards(game, player_cards, player_cards.hand)
      }
    } else if (response === 'curse') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to gain a curse`)
      let card_gainer = new CardGainer(game, player_cards, 'hand', 'Curse')
      card_gainer.gain_game_card()
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in hand`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_some(selected_cards)
    }
  }

}
