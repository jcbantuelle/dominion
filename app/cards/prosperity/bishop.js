Bishop = class Bishop extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
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
    } else if (_.size(player_cards.hand) === 1) {
      Bishop.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    GameModel.update(game._id, game)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
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
      PlayerCardsModel.update(game._id, other_player_cards)
    })
  }

  static trash_card(game, player_cards, selected_cards) {
    if (!_.isEmpty(selected_cards)) {
      let coin_cost = CostCalculator.calculate(game, selected_cards[0])

      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()

      if (game.turn.player._id === player_cards.player_id) {
        let victory_tokens = Math.floor(coin_cost / 2)
        let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
        victory_token_gainer.gain(victory_tokens)
      }
    }
  }

}
