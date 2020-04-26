TheMountainsGift = class TheMountainsGift extends Boon {

  receive(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
