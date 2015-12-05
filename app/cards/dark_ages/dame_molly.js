DameMolly = class DameMolly extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    this.trash_knight(game, player_cards)
  }

}
