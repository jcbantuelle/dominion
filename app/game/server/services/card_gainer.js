CardGainer = class CardGainer {

  constructor(game, username, destination, card_name, buy = false) {
    this.game = game
    this.username = username
    this.destination = destination
    this.card_name = card_name
    this.buy = buy
    this.gain_event_cards = ['Duchy']
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
    this.gain_event()
  }

  gain_game_card(announce = true) {
    let game_card = this.find_card(this.game.cards)
    if (game_card.count > 0) {
      game_card.stack.shift()
      this.destination.unshift(game_card.top_card)
      if (announce) {
        this.update_log(game_card.top_card)
      }
      this.track_gained_card(game_card.top_card)
      game_card.count -= 1
      if (game_card.count > 0) {
        game_card.top_card = _.first(game_card.stack)
      }
      this.gain_event()
    }
  }

  find_card(source) {
    return _.find(source, (card) => {
      return card.name === this.card_name
    })
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

  gain_event() {
    if (_.contains(this.gain_event_cards, this.card_name)) {
      let gained_card = ClassCreator.create(this.card_name)
      gained_card.gain_event(this)
    }
  }

  update_log(card) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.username}</strong> gains ${CardView.render(card)}`)
  }

}
