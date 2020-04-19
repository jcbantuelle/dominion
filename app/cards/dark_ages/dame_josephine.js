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

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

}
