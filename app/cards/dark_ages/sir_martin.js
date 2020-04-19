SirMartin = class SirMartin extends Knights {

  types() {
    return ['action', 'attack', 'knight']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(2)

    let player_attacker = new PlayerAttacker(game, this, card_player)
    player_attacker.attack(player_cards)
  }

}
