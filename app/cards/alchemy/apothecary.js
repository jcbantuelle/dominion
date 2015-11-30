Apothecary = class Apothecary extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    GameModel.update(game._id, game)

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

      let coppers_and_potions = []
      _.each(revealed_cards, function(card) {
        if (_.contains(['Copper', 'Potion'], card.name)) {
          coppers_and_potions.push(card)
        } else {
          player_cards.revealed.push(card)
        }
      })

      if (!_.isEmpty(coppers_and_potions)) {
        player_cards.hand = player_cards.hand.concat(coppers_and_potions)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(coppers_and_potions)} in their hand`)
      }

      if (!_.isEmpty(player_cards.revealed)) {
        GameModel.update(game._id, game)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
          cards: player_cards.revealed
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Apothecary.replace_cards)
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



