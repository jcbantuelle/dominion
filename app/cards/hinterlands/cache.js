Cache = class Cache extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3, false)
  }

  gain_event(gainer) {
    _.times(2, function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Copper')
      card_gainer.gain()
    })
  }
}
