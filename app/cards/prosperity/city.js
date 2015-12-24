City = class City extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let empty_pile_count = _.size(_.filter(game.cards, function(game_card) {
      return game_card.count === 0 && game_card.top_card.purchasable
    }))

    let cards = 1
    if (empty_pile_count > 0) {
      cards += 1
    }
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(cards)

    game.turn.actions += 2
    let log_message = `&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`
    if (empty_pile_count > 1) {
      game.turn.buys += 1
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      log_message += `, +1 buy, and +$${gained_coins}`
    }

    game.log.push(log_message)
  }

}
