TravellingFair = class TravellingFair extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    game.turn.buys += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 buys`)

    game.turn.travelling_fair = true
  }

}
