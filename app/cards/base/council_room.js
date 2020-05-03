CouncilRoom = class CouncilRoom extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(4)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, (next_player_cards) => {
      let next_player_card_drawer = new CardDrawer(game, next_player_cards)
      next_player_card_drawer.draw(1)
      PlayerCardsModel.update(game._id, next_player_cards)
    })
  }

}
