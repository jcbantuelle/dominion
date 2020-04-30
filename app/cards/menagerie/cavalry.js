Cavalry = class Cavalry extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
      card_gainer.gain()
    })
  }

  gain_event(gainer) {
    let card_drawer = new CardDrawer(gainer.game, gainer.player_cards)
    card_drawer.draw(2)

    let buy_gainer = new BuyGainer(gainer.game, gainer.player_cards)
    buy_gainer.gain(1)

    if (_.includes(['treasure', 'buy'], gainer.game.turn.phase)) {
      gainer.game.turn.phase = 'action'
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> returns to their action phase`)
    }
  }

}
