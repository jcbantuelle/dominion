City = class City extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let empty_pile_count = _.size(_.filter(game.cards, function(game_card) {
      return game_card.count === 0 && game_card.supply
    }))

    let cards = empty_pile_count > 0 ? 2 : 1
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(cards)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    if (empty_pile_count > 1) {
      let buy_gainer = new BuyGainer(game, player_cards)
      buy_gainer.gain(1)

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)
    }
  }

}
