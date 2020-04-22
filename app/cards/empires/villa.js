Villa = class Villa extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

  destination() {
    return 'hand'
  }

  gain_event(gainer) {
    let action_gainer = new ActionGainer(gainer.game, gainer.player_cards)
    action_gainer.gain(1)

    if (_.includes(['treasure', 'buy'], gainer.game.turn.phase)) {
      gainer.game.turn.phase = 'action'
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> returns to their action phase`)
    }
  }

}
