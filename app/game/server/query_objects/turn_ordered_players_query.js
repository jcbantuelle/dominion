TurnOrderedPlayersQuery = class TurnOrderedPlayersQuery {

  static turn_ordered_players(game, current_player) {
    let current_player_index = _.findIndex(game.players, function(player) {
      return player._id === current_player._id
    })

    return _.slice(game.players, current_player_index+1).concat(_.slice(game.players, 0, current_player_index))
  }

}
