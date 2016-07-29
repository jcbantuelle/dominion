Donate = class Donate extends Event {

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 8
  }

  buy(game, player_cards) {
    game.turn.donate = true
  }

}


