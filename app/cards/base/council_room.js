CouncilRoom = class CouncilRoom extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(4)

    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_card_drawer = new CardDrawer(game, other_player_cards)
      other_player_card_drawer.draw(1)
      PlayerCardsModel.update(game._id, other_player_cards)
    })
  }

}
