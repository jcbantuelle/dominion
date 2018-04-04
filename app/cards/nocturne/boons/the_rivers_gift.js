TheRiversGift = class TheRiversGift extends Boon {

  receive(game, player_cards) {
    game.turn.river_gifts += 1
    return true
  }

  end_turn_event(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(game.turn.river_gifts)
    game.turn.river_gifts = 0
  }

}
