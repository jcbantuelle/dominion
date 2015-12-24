Lighthouse = class Lighthouse extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.render(duration_card)}`)
  }

}
