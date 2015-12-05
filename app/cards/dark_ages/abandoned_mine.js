AbandonedMine = class AbandonedMine extends Ruins {

  play(game, player_cards) {
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$1`)
  }

}
