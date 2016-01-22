Mission = class Mission extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    game.turn.forbidden_events.push(this.name())
    game.turn.mission = true
  }

}
