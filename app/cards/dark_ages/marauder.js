Marauder = class Marauder extends Card {

  types() {
    return ['action', 'attack', 'looter']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Spoils')
    card_gainer.gain_game_card()

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Ruins')
    card_gainer.gain_game_card()
  }

}
