Diadem = class Diadem extends Card {

  is_purchasable() {
    return false
  }

  types() {
    return ['treasure', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.coins += (2 + game.turn.actions)
  }

}
