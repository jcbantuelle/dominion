Possession = class Possession extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    game.turn.possessions += 1
  }

}
