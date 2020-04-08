DameJosephine = class DameJosephine extends Knights {

  types() {
    return ['action', 'attack', 'knight', 'victory']
  }

  coin_cost() {
    return 5
  }

  victory_points() {
    return 2
  }

  play(game, player_cards, player) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    this.trash_knight(game, player_cards, player.played_card)
  }

}
