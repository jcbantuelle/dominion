ScoutingParty = class ScoutingParty extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 5)
      player_cards.deck = _.drop(player_cards.deck, 5)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 5 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 5 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 5 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> looks at the top ${_.size(player_cards.revealed)} cards of their deck`)

      if (_.size(player_cards.revealed < 4)) {
        ScoutingParty.discard_cards(game, player_cards, player_cards.revealed)
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 3 cards to discard:',
          cards: player_cards.revealed,
          minimum: 3,
          maximum: 3
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(ScoutingParty.discard_cards)
      }
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', _.pluck(selected_cards, 'name'))
    card_discarder.discard()

    if (_.size(player_cards.revealed) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
        cards: player_cards.revealed
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(ScoutingParty.replace_cards)
    } else if (_.size(player_cards.revealed) === 1) {
      ScoutingParty.replace_cards(game, player_cards, _.pluck(player_cards.revealed, 'name'))
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
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the cards back on their deck`)
    player_cards.revealed = []
  }

}
