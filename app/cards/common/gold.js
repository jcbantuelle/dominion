Gold = class Gold extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    game.turn.coins += 3
    Games.update(game._id, game)
  }

}
