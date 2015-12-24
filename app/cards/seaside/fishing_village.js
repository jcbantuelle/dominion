FishingVillage = class FishingVillage extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    game.turn.actions += 2
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions and +$${gained_coins}`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins} from ${CardView.render(duration_card)}`)
  }

}
