Guardian = class Guardian extends Card {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(duration_card)}`)
  }

  destination() {
    return 'hand'
  }

}
