Masquerade = class Masquerade extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    PlayerCards.update(player_cards._id, player_cards)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game)
    ordered_player_cards.splice(0, 1, player_cards)
    _.each(ordered_player_cards, function(other_player_cards) {
      if (_.size(other_player_cards.hand) > 0) {
        let next_player_query = new NextPlayerQuery(game, other_player_cards.player_id)
        let next_player = next_player_query.next_player()
        let turn_event_id = TurnEvents.insert({
          game_id: game._id,
          player_id: other_player_cards.player_id,
          username: other_player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: `Choose a card to pass to ${next_player.username}:`,
          cards: other_player_cards.hand,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, other_player_cards, turn_event_id)
        turn_event_processor.process(Masquerade.pass_card)
      }
    })

    _.each(ordered_player_cards, function(other_player_cards) {
      if (other_player_cards.masquerade) {
        let next_player_query = new NextPlayerQuery(game, other_player_cards.player_id)
        let next_player = next_player_query.next_player()
        let next_player_cards = _.find(ordered_player_cards, function(player) {
          return player.player_id === next_player._id
        })
        next_player_cards.hand.push(other_player_cards.masquerade)
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> passes ${CardView.render(other_player_cards.masquerade)} to ${next_player.username}`)
        delete other_player_cards.masquerade
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> has no cards in hand`)
      }
    })

    _.each(ordered_player_cards, function(other_player_cards) {
      PlayerCards.update(other_player_cards._id, other_player_cards)
    })

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash (Or none to skip):',
        cards: player_cards.hand,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Masquerade.trash_cards)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }
  }

  static pass_card(game, player_cards, selected_cards) {
    let passed_card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_cards[0].name
    })
    player_cards.masquerade = player_cards.hand.splice(passed_card_index, 1)[0]
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

}
