LostCity = class LostCity extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

  gain_event(gainer) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(gainer.game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_card_drawer = new CardDrawer(gainer.game, other_player_cards)
      other_player_card_drawer.draw(1)
      PlayerCardsModel.update(gainer.game._id, other_player_cards)
    })
  }

}
