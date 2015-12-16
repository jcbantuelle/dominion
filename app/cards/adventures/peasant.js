Peasant = class Peasant extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$1`)
  }

  discard_event(discarder) {
    this.choose_exchange(discarder.game, discarder.player_cards, 'Peasant', 'Soldier')
  }

}
