CardTrasher = class CardTrasher {

  constructor(game, player_cards, source, card_names) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    this.card_names = _.isArray(card_names) ? card_names : [card_names]
    this.trashed_cards = []
  }

  trash() {
    _.each(this.card_names, (card_name) => {
      let card_index = this.find_card_index(card_name)
      if (card_index !== -1) {
        this.trash_card(card_index)
      }
    })
    this.update_log()
  }

  find_card_index(card_name) {
    return _.findIndex(this.player_cards[this.source], (card) => {
      return card.name === card_name
    })
  }

  trash_card(card_index) {
    this.game.trash.push(this.player_cards[this.source][card_index])
    this.trashed_cards = this.trashed_cards.concat(this.player_cards[this.source].splice(card_index, 1))
  }

  update_log() {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> trashes ${CardView.render(this.trashed_cards)}`)
  }

}
