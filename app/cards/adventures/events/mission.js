Mission = class Mission extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    if (game.turn.previous_player._id !== game.turn.player._id) {
      game.turn.mission = this.to_h()
    }
  }

}
