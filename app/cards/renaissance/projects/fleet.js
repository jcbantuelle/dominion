Fleet = class Fleet extends Project {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    player_cards.fleet = true
  }

}
