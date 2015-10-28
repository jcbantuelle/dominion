CardTrasher = class CardTrasher {

  constructor(game, username, source, card_name) {
    this.game = game
    this.username = username
    this.source = source
    this.card_name = card_name
  }

  trash() {
    this.card_index = this.find_card_index()
    if (this.card_index !== -1) {
      this.update_log()
      this.trash_card()
    }
    return [this.game, this.source]
  }

  find_card_index() {
    return _.findIndex(this.source, (card) => {
      return card.name === this.card_name
    })
  }

  trash_card() {
    this.game.trash.push(this.source[this.card_index])
    this.source.splice(this.card_index, 1)
  }

  update_log(card) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.username}</strong> trashes <span class="${this.source[this.card_index].types}">${this.source[this.card_index].name}</span>`)
  }

}
