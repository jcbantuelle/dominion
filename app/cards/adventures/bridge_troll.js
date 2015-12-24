BridgeTroll = class BridgeTroll extends Card {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    player_cards.duration_effects.push(this.to_h())

    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    return 'duration'
  }

  attack(game, player_cards) {
    if (!player_cards.tokens.minus_coin) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes their -$1 token`)
      player_cards.tokens.minus_coin = true
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has their -$1 token`)
    }
  }

  duration(game, player_cards, duration_card) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy from ${CardView.render(this)}`)
  }

}
