WanderingMinstrel = class WanderingMinstrel extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      player_cards.revealed = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(player_cards.revealed)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        let deck_shuffler = new DeckShuffler(game, player_cards)
        deck_shuffler.shuffle()
        player_cards.revealed = player_cards.revealed.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.revealed)}`)

      player_cards.minstrel_actions = _.filter(player_cards.revealed, function(card) {
        return _.includes(_.words(card.types), 'action')
      })
      player_cards.revealed = _.filter(player_cards.revealed, function(card) {
        return !_.includes(_.words(card.types), 'action')
      })

      if (_.size(player_cards.minstrel_actions) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
          cards: player_cards.minstrel_actions
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(WanderingMinstrel.replace_cards)
      } else if (_.size(player_cards.minstrel_actions) === 1) {
        WanderingMinstrel.replace_cards(game, player_cards, player_cards.minstrel_actions)
      }

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      delete player_cards.minstrel_actions
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function(ordered_card) {
      let action_index = _.findIndex(player_cards.minstrel_actions, function(card) {
        return card.id === ordered_card.id
      })
      let action = player_cards.minstrel_actions.splice(action_index, 1)[0]
      player_cards.deck.unshift(action)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the actions back on their deck`)
  }

}
