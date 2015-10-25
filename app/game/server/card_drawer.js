CardDrawer = class CardDrawer {

  constructor(player_cards, game) {
    this.player_cards = player_cards
    this.game = game
    this.drawn_cards = 0
    this.original_hand_count = _.size(this.player_cards.hand)
  }

  draw(to_draw_count, announce = false) {
    this.draw_cards(to_draw_count)

    if (this.drawn_card_count() < to_draw_count) {
      this.shuffle_discard()
      this.draw_cards(to_draw_count - this.drawn_card_count())
    }

    if (announce) {
      this.update_log()
    }

    return [this.player_cards, this.game]
  }

  draw_cards(count) {
    this.player_cards.hand = this.player_cards.hand.concat(_.take(this.player_cards.deck, count))
    this.player_cards.deck = _.drop(this.player_cards.deck, count)
  }

  shuffle_discard() {
    this.player_cards.deck = _.shuffle(this.player_cards.discard)
    this.player_cards.discard = []
  }

  drawn_card_count() {
    return _.size(this.player_cards.hand) - this.original_hand_count
  }

  update_log() {
    let player = Meteor.users.findOne(this.player_cards.player_id)
    this.game.log.push(`&nbsp;&nbsp;<strong>${player.username}</strong> draws ${this.drawn_card_count()} card(s)`)
  }

}
