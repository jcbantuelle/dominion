Greed = class Greed extends Hex {

  receive(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Copper')
    card_gainer.gain()
  }

}
