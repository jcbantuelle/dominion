NextPlayerQuery = class NextPlayerQuery {

  constructor(game, player_id) {
    this.game = game
    this.player_id = player_id
  }

  next_player() {
    return this.game.players[this.next_player_index()]
  }

  next_player_index() {
    let player_index = this.current_player_index() + 1
    return player_index === _.size(this.game.players) ? 0 : player_index
  }

  current_player_index() {
    return _.findIndex(this.game.players, (player) => {
      return player._id === this.player_id
    })
  }

}
