CardDiscarder = class CardDiscarder {

  constructor(game, player_cards, source) {
    this.game = game
    this.player_cards = player_cards
    this.source = source
    this.discard_reaction_cards = ['Tunnel']
  }

  discard_all(announce = true) {
    if (announce) {
      this.update_log(this.player_cards[this.source])
    }
    this.discard_reactions(this.player_cards[this.source])
    this.move_to_discard(this.player_cards[this.source])
    this.player_cards[this.source] = []
  }

  discard_some(cards, announce = true) {
    if (announce) {
      this.update_log(cards)
    }
    this.discard_reactions(cards)
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
      this.discard_reactions(cards)
      this.move_to_discard(cards)
      this.remove_from_source(cards)
    } else {
      if (announce) {
        let card = ClassCreator.create(card_name)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no ${CardView.render(card)} in ${this.source}`)
      }
    }
  }

  discard_reactions(cards) {
    let discard_reactions = _.filter(cards, (card) => {
      return _.contains(this.discard_reaction_cards, card.name)
    })
    _.each(discard_reactions, (card) => {
      ReactionProcessor.discard_reaction(this.game, this.player_cards, card)
    })
  }

  move_to_discard(cards) {
    if (this.source === 'in_play') {
      let discard_in_play_processor = new DiscardInPlayProcessor(this.game, this.player_cards)
      discard_in_play_processor.process_cards()
    }
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
    if (!_.isEmpty(cards)) {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> discards ${CardView.render(cards)}`)
    }
  }

}
