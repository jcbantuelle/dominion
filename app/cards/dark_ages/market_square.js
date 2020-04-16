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

    game.turn.actions += 1
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +1 buy`)
  }

  trash_reaction(game, player_cards, trasher, card) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', card)
    card_discarder.discard()

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

}
