Plague = class Plague extends Hex {

  receive(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'hand', 'Curse')
    card_gainer.gain()
  }

}
