Lighthouse = class Lighthouse extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, lighthouse) {
    let coin_gainer = new CoinGainer(game, player_cards, lighthouse)
    coin_gainer.gain(1)
  }

}
