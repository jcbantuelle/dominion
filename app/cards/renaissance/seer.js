Seer = class Seer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    PlayerCardsModel.update(game._id, player_cards)
    GameModel.update(game._id, game)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let revealed_cards = _.take(player_cards.deck, 3)
      player_cards.deck = _.drop(player_cards.deck, 3)

      let revealed_card_count = _.size(revealed_cards)
      if (revealed_card_count < 3 && _.size(player_cards.discard) > 0) {
        DeckShuffler.shuffle(game, player_cards)
        revealed_cards = revealed_cards.concat(_.take(player_cards.deck, 3 - revealed_card_count))
        player_cards.deck = _.drop(player_cards.deck, 3 - revealed_card_count)
      }

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)

      let revealed_costing_2_to_4 = []
      _.each(revealed_cards, function(card) {
        if (CardCostComparer.coin_between(game, card, 2, 4)) {
          revealed_costing_2_to_4.push(card)
        } else {
          player_cards.revealed.push(card)
        }
      })

      if (!_.isEmpty(revealed_costing_2_to_4)) {
        player_cards.hand = player_cards.hand.concat(revealed_costing_2_to_4)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(revealed_costing_2_to_4)} in their hand`)
      }

      if (_.size(player_cards.revealed) > 1) {
        GameModel.update(game._id, game)
        PlayerCardsModel.update(game._id, player_cards)
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to place cards on deck: (leftmost will be top card)',
          cards: player_cards.revealed
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Seer.replace_cards)
      } else if (_.size(player_cards.revealed) === 1) {
        Seer.replace_cards(game, player_cards, player_cards.revealed)
      }
    }
  }

  static replace_cards(game, player_cards, ordered_cards) {
    _.each(ordered_cards.reverse(), function (ordered_card) {
      let revealed_card_index = _.findIndex(player_cards.revealed, function (card) {
        return card.id === ordered_card.id
      })
      let revealed_card = player_cards.revealed.splice(revealed_card_index, 1)[0]
      player_cards.deck.unshift(revealed_card)
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places the remaining cards back on their deck`)
    player_cards.revealed = []
  }

}
