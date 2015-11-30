Bishop = class Bishop extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 1
    player_cards.victory_tokens += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1 and +1 &nabla;`)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Bishop.trash_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    GameModel.update(game._id, game)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      if (_.size(other_player_cards.hand) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: other_player_cards.player_id,
          username: other_player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to trash (Or none to skip):',
          cards: other_player_cards.hand,
          minimum: 0,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, other_player_cards, turn_event_id)
        turn_event_processor.process(Bishop.trash_card)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> does not trash a card`)
      }
      PlayerCardsModel.update(other_player_cards._id, other_player_cards)
    })
  }

  static trash_card(game, player_cards, selected_cards) {
    let trashed_card = selected_cards[0]
    if (trashed_card) {
      let coin_cost = CostCalculator.calculate(game, trashed_card)

      let card_trasher = new CardTrasher(game, player_cards, 'hand', trashed_card.name)
      card_trasher.trash()

      if (game.turn.player._id === player_cards.player_id) {
        let victory_tokens = Math.floor(coin_cost / 2)
        player_cards.victory_tokens += victory_tokens
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
      }
    }
  }

}
