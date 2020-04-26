GhostTown = class GhostTown extends Duration {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, ghost_town) {
    let card_drawer = new CardDrawer(game, player_cards, ghost_town)
    let drawn_count = card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards, ghost_town)
    action_gainer.gain(1)
  }

  destination() {
    return 'hand'
  }

}
