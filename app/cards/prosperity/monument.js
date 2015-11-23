Monument = class Monument extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 2
    player_cards.victory_tokens += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2 and +1 &nabla;`)
  }

}
