CardGainer = class CardGainer {

  constructor(game, username, destination, card_name, buy = false) {
    this.game = game
    this.username = username
    this.destination = destination
    this.card_name = card_name
    this.buy = buy
  }

  gain_common_card(announce = true) {
    this.gain_game_card(this.game.common_cards, announce)
  }

  gain_kingdom_card(announce = true) {
    this.gain_game_card(this.game.kingdom_cards, announce)
  }

  gain_trash_card(announce = true) {
    let card_index = this.find_card_index(this.game.trash)
    let gained_card = this.game.trash[card_index]
    this.track_gained_card(gained_card)
    this.destination.unshift(gained_card)
    this.game.trash.splice(card_index, 1)
    if (announce) {
      this.update_log(gained_card)
    }
  }

  gain_game_card(source, announce) {
    let card_index = this.find_card_index(source)
    if (source[card_index].count > 0) {
      source[card_index].stack.shift()
      this.destination.unshift(source[card_index].top_card)
      if (announce) {
        this.update_log(source[card_index].top_card)
      }
      this.track_gained_card(source[card_index].top_card)
      source[card_index].count -= 1
      if (source[card_index].count > 0) {
        source[card_index].top_card = _.first(source[card_index].stack)
      }
    }
  }

  find_card_index(source) {
    return _.findIndex(source, (card) => {
      return card.name === this.card_name
    })
  }

  track_gained_card(card) {
    let gained_card = _.clone(card)
    gained_card.from = this.buy ? 'buy' : 'gain'
    this.game.turn.gained_cards.push(gained_card)
  }

  update_log(card) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.username}</strong> gains ${CardView.render(card)}`)
  }

}
