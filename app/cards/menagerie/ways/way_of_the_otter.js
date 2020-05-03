WayOfTheOtter = class WayOfTheOtter extends Way {

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

}
