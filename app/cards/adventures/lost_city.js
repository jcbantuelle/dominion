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

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  gain_event(gainer) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(gainer.game, gainer.player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let other_player_card_drawer = new CardDrawer(gainer.game, other_player_cards)
      other_player_card_drawer.draw(1)
      PlayerCardsModel.update(gainer.game._id, other_player_cards)
    })
  }

}
