CaravanGuard = class CaravanGuard extends Card {

  types() {
    return ['action', 'duration', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    if (player_cards.player_id === game.turn.player._id) {
      game.turn.actions += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    }
    return 'duration'
  }

  attack_event(game, player_cards) {
    let card_player = new CardPlayer(game, player_cards, this.name(), true)
    card_player.play()
  }

  duration(game, player_cards, duration_card) {
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1 from ${CardView.render(duration_card)}`)
  }

}
