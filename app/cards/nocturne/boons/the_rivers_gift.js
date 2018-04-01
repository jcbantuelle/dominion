TheRiversGift = class TheRiversGift extends Boon {

  receive(game, player_cards) {
    game.river_gift = true
    return true
  }

  end_turn_event(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)
  }

}
