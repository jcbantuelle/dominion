Expedition = class Expedition extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    game.turn.expeditions += 1
  }
}
