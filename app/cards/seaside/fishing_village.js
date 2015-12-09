FishingVillage = class FishingVillage extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    game.turn.actions += 2
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions and +$1`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    game.turn.actions += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$1 from ${CardView.render(duration_card)}`)
  }

}
