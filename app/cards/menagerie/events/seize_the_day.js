SeizeTheDay = class SeizeTheDay extends Event {

  coin_cost() {
    return 4
  }

  buy(game, player_cards) {
    player_cards.seize_the_day = true
    game.turn.seize_the_day = this.to_h()
  }

}
