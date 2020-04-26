BridgeTroll = class BridgeTroll extends Duration {

  types() {
    return ['action', 'duration', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let player_attacker = new PlayerAttacker(game, this)
    player_attacker.attack(player_cards)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    player_cards.duration_effects.push(_.clone(card_player.card))
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

  duration(game, player_cards, bridge_troll) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1, bridge_troll)
  }

}
