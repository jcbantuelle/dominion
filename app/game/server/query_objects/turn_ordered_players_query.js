TurnOrderedPlayersQuery = class TurnOrderedPlayersQuery {

  static turn_ordered_players(game) {
    let current_player_index = _.findIndex(game.players, function(player) {
      return player._id === game.turn.player._id
    })

    return _.slice(game.players, current_player_index).concat(_.slice(game.players, 0, current_player_index))
  }

}
