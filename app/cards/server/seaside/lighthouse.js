Lighthouse = class Lighthouse extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$1`)
    return 'duration'
  }

  duration(game, player_cards) {
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1 from ${CardView.render(this)}`)
  }

}
