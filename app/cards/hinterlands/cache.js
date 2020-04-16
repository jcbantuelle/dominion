Cache = class Cache extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 3)
  }

  gain_event(gainer) {
    _.times(2, function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Copper')
      card_gainer.gain()
    })
  }
}
