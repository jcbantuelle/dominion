Outpost = class Outpost extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.outpost = true
    if (!game.turn.outpost_turn) {
      return 'duration'
    }
  }

}
