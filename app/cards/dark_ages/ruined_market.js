RuinedMarket = class RuinedMarket extends Ruins {

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)
  }

}
