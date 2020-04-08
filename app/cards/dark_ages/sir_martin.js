SirMartin = class SirMartin extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, player) {
    game.turn.buys += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 buys`)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    this.trash_knight(game, player_cards, player.played_card)
  }

}
