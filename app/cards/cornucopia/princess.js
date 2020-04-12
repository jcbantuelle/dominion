Princess = class Princess extends Card {

  types() {
    return ['action', 'prize']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
  }

}
