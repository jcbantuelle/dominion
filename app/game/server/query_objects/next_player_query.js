NextPlayerQuery = class NextPlayerQuery {

  constructor(game, player_id) {
    this.game = game
    this.player_id = player_id
  }

  next_player() {
    if (this.game.game_over) {
      return this.next_fleet_player()
    } else {
      return this.game.players[this.next_player_index()]
    }
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

  next_fleet_player() {
    let sequenced_player_indices = [this.next_player_index()]
    let player_count = _.size(this.game.players)
    _.times(player_count - 1, () => {
      let next_index = _.last(sequenced_player_indices) + 1
      if (next_index === player_count) {
        next_index = 0
      }
      sequenced_player_indices.push(next_index)
    })

    let fleet_player_index = _.find(sequenced_player_indices, (player_index) => {
      let player = this.game.players[player_index]
      let player_cards = PlayerCardsModel.findOne(this.game._id, player._id)
      return player_cards.fleet
    })

    return this.game.players[fleet_player_index]
  }

}
