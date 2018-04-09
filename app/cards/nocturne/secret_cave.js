SecretCave = class SecretCave extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.hand) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Discard 3 Cards?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SecretCave.choose_discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }

    if (game.turn.secret_cave_discard) {
      player_cards.duration_effects.push(this.to_h())
      return 'duration'
    }
  }

  static choose_discard(game, player_cards, response) {
    if (response === 'yes') {
      if (_.size(player_cards.hand) > 3) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 3 cards to discard:',
          cards: player_cards.hand,
          minimum: 3,
          maximum: 3
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(SecretCave.discard_cards)
      } else {
        SecretCave.discard_cards(game, player_cards, player_cards.hand)
      }
    } else {
      game.turn.secret_cave_discard = false
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.map(selected_cards, 'name'))
    card_discarder.discard()
    game.turn.secret_cave_discard = _.size(selected_cards) === 3
  }

  duration(game, player_cards, duration_card) {
    let gained_coins = CoinGainer.gain(game, player_cards, 3)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
