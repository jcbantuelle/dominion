RuinedVillage = class RuinedVillage extends Card {

  types() {
    return ['action', 'ruins']
  }

  stack_name() {
    return 'Ruins'
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
  }

}
