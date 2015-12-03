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

  trash_reaction(game, player_cards, trasher) {
    let market_square = _.find(player_cards.hand, function(card) {
      return card.name === 'Market Square'
    })
    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard_some([market_square])

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()
  }

}
