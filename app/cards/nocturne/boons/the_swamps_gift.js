TheSwampsGift = class TheSwampsGift extends Boon {

  receive(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Will O Wisp')
    card_gainer.gain_game_card()
  }

}
