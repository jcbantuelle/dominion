DameSylvia = class DameSylvia extends Knights {

  types() {
    return this.capitalism_types(['action', 'attack', 'knight'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

}
