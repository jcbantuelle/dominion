Necropolis = class Necropolis extends Card {

  types() {
    return ['action', 'shelter']
  }

  coin_cost() {
    return 1
  }

  play(game, player_cards) {
    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

}
