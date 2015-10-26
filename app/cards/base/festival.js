Festival = class Festival extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.turn.buys += 1
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions, +1 buy, and +$2`)
    Games.update(game._id, game)
  }

}
