CardTrasher = class CardTrasher {

  constructor(game, username, source, card_names) {
    this.game = game
    this.username = username
    this.source = source
    this.card_names = _.isArray(card_names) ? card_names : [card_names]
    this.card_log = []
  }

  trash() {
    _.each(this.card_names, (card_name) => {
      let card_index = this.find_card_index(card_name)
      if (card_index !== -1) {
        this.update_card_log(card_index)
        this.trash_card(card_index)
      }
    })
    this.update_log()
  }

  find_card_index(card_name) {
    return _.findIndex(this.source, (card) => {
      return card.name === card_name
    })
  }

  update_card_log(card_index) {
    this.card_log.push(`<span class="${this.source[card_index].types}">${this.source[card_index].name}</span>`)
  }

  trash_card(card_index) {
    this.game.trash.push(this.source[card_index])
    this.source.splice(card_index, 1)
  }

  update_log() {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.username}</strong> trashes ${this.card_log.join(' ')}`)
  }

}
