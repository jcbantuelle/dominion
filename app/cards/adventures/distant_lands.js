DistantLands = class DistantLands extends Card {

  types() {
    return ['action', 'reserve', 'victory']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    this.move_to_tavern(game, player_cards, 'Distant Lands')
  }

  victory_points(player_cards, source) {
    if (source === 'tavern') {
      return 4
    } else {
      return 0
    }
  }

}
