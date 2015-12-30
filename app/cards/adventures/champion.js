Champion = class Champion extends Card {

  is_purchasable() {
    false
  }

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    player_cards.champions += 1

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    return 'permanent'
  }

}
