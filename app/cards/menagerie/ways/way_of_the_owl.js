WayOfTheOwl = class WayOfTheOwl extends Way {

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw_until(6)
  }

}
