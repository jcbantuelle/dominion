CardDiscarder = class CardDiscarder {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
  }

  discard_all(announce = true) {
    if (announce) {
      this.update_log(this.player_cards[this.source])
    }
    this.move_to_discard(this.player_cards[this.source])
    this.player_cards[this.source] = []
  }

  discard_some(cards, announce = true) {
    if (announce) {
      this.update_log(cards)
    }
    this.move_to_discard(cards)
    this.remove_from_source(cards)
  }

  discard_by_name(card_name, announce = false) {
    let card_index = _.findIndex(this.player_cards[this.source], function(card) {
      return card.name === card_name
    })

    if (card_index !== -1) {
      let cards = [this.player_cards[this.source][card_index]]
      if (announce) {
        this.update_log(cards)
      }
      this.move_to_discard(cards)
      this.remove_from_source(cards)
    } else {
      if (announce) {
        let card = ClassCreator.create(card_name)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no ${CardView.render(card)} in ${this.source}`)
      }
    }
  }

  move_to_discard(cards) {
    this.player_cards.discard = cards.concat(this.player_cards.discard)
  }

  remove_from_source(cards) {
    _.each(cards, (card) => {
      let card_index = _.findIndex(this.player_cards[this.source], function(source_card) {
        return source_card.name === card.name
      })
      this.player_cards[this.source].splice(card_index, 1)
    })
  }

  update_log(cards) {
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(cards)}`)
  }

}
