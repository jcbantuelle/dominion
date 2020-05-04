PlayerActionUndoer = class PlayerActionUndoer {

  static track_action(game, player_cards) {
    let previous_state = game
    previous_state.ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    game.previous_state = _.cloneDeep(previous_state)
  }

  static undo_action(game, player_cards) {
    game.log.push(`<strong>${player_cards.username}</strong> requests to undo their last action`)
    GameModel.update(game._id, game)
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    let allow_undo = []
    _.each(ordered_player_cards, (next_player_cards) => {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: next_player_cards.player_id,
        username: next_player_cards.username,
        type: 'choose_yes_no',
        instructions: `Allow ${player_cards.username} to undo their last action?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      allow_undo.push(turn_event_processor.process(PlayerActionUndoer.allow_undo))
    })

    let undo_permitted = _.every(allow_undo, (response) => {
      return response === 'yes'
    })

    if (undo_permitted) {
      let previous_state = game.previous_state
      let game_log = game.log
      game.log.push(`<strong>${player_cards.username}</strong> undoes their last action`)
      _.each(previous_state.ordered_player_cards, (player_cards) => {
        PlayerCardsModel.update(game._id, player_cards)
      })
      delete previous_state.ordered_player_cards
      previous_state.previous_state = false
      previous_state.log = game_log
      GameModel.update(game._id, previous_state)
    } else {
      game.log.push(`&nbsp;&nbsp;but the request was denied`)
      GameModel.update(game._id, game)
    }
  }

  static allow_undo(game, player_cards, response) {
    return response
  }

}