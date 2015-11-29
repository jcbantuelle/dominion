Coppersmith = class Coppersmith extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coppersmiths += 1
  }

}
