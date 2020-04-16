Fortune = class Fortune extends Card {

  types() {
    return ['treasure']
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
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    if (!game.turn.fortune) {
      game.turn.fortune = true
      let gained_coins = CoinGainer.gain(game, player_cards, game.turn.coins)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    }
  }

  gain_event(gainer) {
    let gladiators = _.filter(gainer.player_cards.playing.concat(gainer.player_cards.in_play).concat(gainer.player_cards.duration).concat(gainer.player_cards.permanent), function(card) {
      return card.name === 'Gladiator'
    })
    _.times(_.size(gladiators), function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Gold')
      card_gainer.gain()
    })
  }

}
