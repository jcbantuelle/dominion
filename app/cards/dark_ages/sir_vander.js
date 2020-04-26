SirVander = class SirVander extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

  trash_event(trasher) {
    let card_gainer = new CardGainer(trasher.game, trasher.player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

}
