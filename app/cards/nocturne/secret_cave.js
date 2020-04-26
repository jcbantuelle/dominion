SecretCave = class SecretCave extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let discarded_card_count = 0
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
      discarded_card_count = turn_event_processor.process(SecretCave.choose_discard)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }

    if (discarded_card_count === 3) {
      player_cards.duration_effects.push(_.clone(card_player.card))
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
        return turn_event_processor.process(SecretCave.discard_cards)
      } else {
        return SecretCave.discard_cards(game, player_cards, player_cards.hand)
      }
    } else {
      return 0
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', selected_cards)
    card_discarder.discard()
    return _.size(selected_cards)
  }

  duration(game, player_cards, secret_cave) {
    let coin_gainer = new CoinGainer(game, player_cards, secret_cave)
    coin_gainer.gain(3)
  }

}
