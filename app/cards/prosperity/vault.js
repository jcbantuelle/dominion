Vault = class Vault extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to discard:',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Vault.discard_cards_for_coins)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(cards) {
      if (!_.isEmpty(cards.hand)) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: cards.player_id,
          username: cards.username,
          type: 'choose_yes_no',
          instructions: 'Discard 2 cards?',
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, cards, turn_event_id)
        turn_event_processor.process(Vault.choose_discard)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${cards.username} does not have any cards in hand`)
      }
    })
  }

  static discard_cards_for_coins(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not discard anything`)
    } else {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_discarder.discard()

      let gained_coins = CoinGainer.gain(game, player_cards, _.size(selected_cards))
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

  static choose_discard(game, player_cards, response) {
    if (response === 'yes') {
      if (_.size(player_cards.hand) < 3) {
        Vault.discard_cards_for_draw(game, player_cards, player_cards.hand)
      } else {
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
        turn_event_processor.process(Vault.discard_cards_for_draw)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to discard`)
    }
  }

  static discard_cards_for_draw(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
    card_discarder.discard()

    if (_.size(selected_cards) > 1) {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(1)
    }
    PlayerCardsModel.update(game._id, player_cards)
  }

}
