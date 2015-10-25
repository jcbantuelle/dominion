Copper = class Copper extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.coins += 1
    Games.update(game._id, game)
  }

}
