DistantLands = class DistantLands extends Reserve {

  types() {
    return ['action', 'reserve', 'victory']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  victory_points(player_cards, source) {
    if (source === 'tavern') {
      return 4
    } else {
      return 0
    }
  }

}
