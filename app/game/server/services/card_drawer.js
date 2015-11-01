CardDrawer = class CardDrawer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.drawn_cards = 0
    this.original_hand_count = _.size(this.player_cards.hand)
  }

  draw(to_draw_count, announce = true) {
    this.draw_cards(to_draw_count)

    if (this.drawn_card_count() < to_draw_count) {
      this.shuffle_discard()
      this.draw_cards(to_draw_count - this.drawn_card_count())
    }

    if (announce) {
      this.update_log()
    }
  }

  draw_cards(count) {
    this.player_cards.hand = this.player_cards.hand.concat(_.take(this.player_cards.deck, count))
    this.player_cards.deck = _.drop(this.player_cards.deck, count)
  }

  shuffle_discard() {
    let deck_shuffler = new DeckShuffler(this.player_cards)
    deck_shuffler.shuffle()
  }

  drawn_card_count() {
    return _.size(this.player_cards.hand) - this.original_hand_count
  }

  update_log() {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> draws ${this.drawn_card_count()} card(s)`)
  }

}
