Peasant = class Peasant extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)
  }

  discard_event(discarder, peasant) {
    this.choose_exchange(discarder.game, discarder.player_cards, peasant, 'Soldier')
  }

}
