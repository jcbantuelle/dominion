Outpost = class Outpost extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.outpost = true
    if (game.turn.previous_player._id !== game.turn.player._id) {
      return 'duration'
    }
  }

}
