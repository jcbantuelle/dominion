CardDiscarder = class CardDiscarder {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  discard_all(announce = false) {
    if (announce) {
      this.update_log(this.player_cards[this.source])
    }
    this.move_to_discard(this.player_cards[this.source])
    this.player_cards[this.source] = []
    return [this.game, this.player_cards]
  }

  move_to_discard(cards) {
    this.player_cards.discard = cards.concat(this.player_cards.discard)
  }

  update_log(cards) {
    let card_list = _.map(cards, function(card) {
      `<span class="${card.types}">${card.name}</span>`
    }).join(' ')
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${card_list}`)
  }

}
