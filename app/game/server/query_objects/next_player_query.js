NextPlayerQuery = class NextPlayerQuery {

  constructor(game, player_id) {
    this.game = game
    this.player_id = player_id
  }

  next_player() {
    return this.game.players[this.next_player_index()]
  }

  next_player_index() {
    return (this.current_player_index() + 1) % _.size(this.game.players)
  }

  current_player_index() {
    return _.findIndex(this.game.players, (player) => {
      return player._id === this.player_id
    })
  }

}
