Scout = class Scout extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      revealed_cards = _.take(player_cards.deck, 4)
      player_cards.deck = _.drop(player_cards.deck, 4)

      let revealed_card_count = _.size(revealed_cards)
      if (revealed_card_count < 4 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(player_cards)
        revealed_cards = revealed_cards.concat(_.take(player_cards.deck, 4 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 4 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)

      let victory_cards = []
      _.each(revealed_cards, function(card) {
        if (_.contains(card.types, 'victory')) {
          victory_cards.push(card)
        } else {
          player_cards.revealed.push(card)
        }
      })

      if (!_.isEmpty(victory_cards)) {
        player_cards.hand = player_cards.hand.concat(victory_cards)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(victory_cards)} in their hand`)
      }

      if (!_.isEmpty(player_cards.revealed)) {
        GameModel.update(game._id, game)
        PlayerCards.update(player_cards._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
          cards: player_cards.revealed
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Scout.replace_cards)
      }
    }
  }

  static replace_cards(game, player_cards, ordered_card_names) {
    _.each(ordered_card_names.reverse(), function(card_name) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function(card) {
        return card.name === card_name
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards back on their deck`)
    player_cards.revealed = []
  }

}



