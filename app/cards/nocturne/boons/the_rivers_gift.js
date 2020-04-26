TheRiversGift = class TheRiversGift extends Boon {

  receive(game, player_cards) {
    player_cards.end_turn_event_effects.push(this.to_h())

    return true
  }

  end_turn_event(game, player_cards, rivers_gift) {
    let card_drawer = new CardDrawer(game, player_cards, rivers_gift)
    card_drawer.draw(1)
  }

}
