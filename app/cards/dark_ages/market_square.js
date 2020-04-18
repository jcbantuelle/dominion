MarketSquare = class MarketSquare extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

  trash_reaction(game, player_cards, trasher, market_square) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', market_square)
    card_discarder.discard()

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

}
