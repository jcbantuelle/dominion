TheSeasGift = class TheSeasGift extends Boon {

  receive(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)
  }

}
