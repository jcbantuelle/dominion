DeckShuffler = class DeckShuffler {

  constructor(player_cards) {
    this.player_cards = player_cards
  }

  shuffle() {
    this.player_cards.deck = _.shuffle(this.player_cards.discard)
    this.player_cards.discard = []
  }

}
