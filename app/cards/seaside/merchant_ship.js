MerchantShip = class MerchantShip extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2 from ${CardView.render(duration_card)}`)
  }

}
