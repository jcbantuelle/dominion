DeckShuffler = class DeckShuffler {

  static shuffle(game, player_cards) {
    player_cards.deck = _.shuffle(player_cards.discard)
    player_cards.discard = []
  }

}
