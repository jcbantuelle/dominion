Guardian = class Guardian extends Duration {

  types() {
    return ['night', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, guardian) {
    let coin_gainer = new CoinGainer(game, player_cards, guardian)
    coin_gainer.gain(1)
  }

  destination() {
    return 'hand'
  }

}
