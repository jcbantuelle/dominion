Relic = class Relic extends Card {

  types() {
    return ['treasure', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)

    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)
  }

  attack(game, player_cards) {
    if (!player_cards.tokens.minus_card) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes their -1 card token`)
      player_cards.tokens.minus_card = true
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has their -1 card token`)
    }
  }

}
