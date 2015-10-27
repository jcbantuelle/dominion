CardGainer = class CardGainer {

  constructor(game, player, destination, card_name) {
    this.game = game
    this.player = player
    this.destination = destination
    this.card_name = card_name
  }

  gain_common_card(announce = true) {
    this.game.common_cards = this.gain_game_card(this.game.common_cards, announce)
    return [this.game, this.destination]
  }

  gain_kingdom_card(announce = true) {
    this.game.kingdom_cards = this.gain_game_card(this.game.kingdom_cards, announce)
    return [this.game, this.destination]
  }

  gain_game_card(source, announce) {
    let card_index = this.find_card_index(source)
    if (source[card_index].count > 0) {
      source[card_index].stack.shift()
      this.destination.push(source[card_index].top_card)
      if (announce) {
        this.update_log(source[card_index].top_card)
      }
      source[card_index].count -= 1
      if (source[card_index].count > 0) {
        source[card_index].top_card = _.first(source[card_index].stack)
      }
    }
    return source
  }

  find_card_index(source) {
    return _.findIndex(source, (card) => {
      return card.name === this.card_name
    })
  }

  update_log(card) {
    this.game.log.push(`<strong>${this.player.username}</strong> gains <span class="${card.types}">${card.name}</span>`)
  }

}
