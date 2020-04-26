Fortune = class Fortune extends Card {

  types() {
    return ['treasure']
  }

  pile_types() {
    return ['action']
  }

  coin_cost() {
    return 8
  }

  debt_cost() {
    return 8
  }

  stack_name() {
    return 'Gladiator/Fortune'
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (!game.turn.fortune) {
      game.turn.fortune = true
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(game.turn.coins)
    }
  }

  gain_event(gainer) {
    let gladiators = _.filter(gainer.player_cards.in_play, function(card) {
      return card.name === 'Gladiator'
    })
    _.times(_.size(gladiators), function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Gold')
      card_gainer.gain()
    })
  }

}
