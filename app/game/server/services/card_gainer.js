CardGainer = class CardGainer {

  constructor(game, player_cards, destination, card_name, buy = false) {
    this.game = game
    this.player_cards = player_cards
    this.destination = this.gain_destination(destination)
    this.card_name = card_name
    this.buy = buy
    this.gain_event_cards = ['Duchy', 'Cache', 'Embassy', 'Ill Gotten Gains', 'Inn']
    this.gain_destination_cards = ['Nomad Camp']
  }

  gain_trash_card() {
    this.would_gain_reactions()
    if (this.gain_from_game_cards) {
      this.gain_game_card()
    } else {
      let card_index = this.find_card_index(this.game.trash)
      let gained_card = this.game.trash[card_index]
      this.track_gained_card(gained_card)
      this.player_cards[this.destination].unshift(gained_card)
      this.game.trash.splice(card_index, 1)
      this.update_log(gained_card)
      this.gain_event()
      this.gain_reactions()
    }
  }

  gain_game_card() {
    if (!this.gain_from_game_cards) {
      this.would_gain_reactions()
    }
    let game_card = this.find_card(this.game.cards)
    if (game_card.count > 0) {
      game_card.stack.shift()
      this.player_cards[this.destination].unshift(game_card.top_card)
      this.update_log(game_card.top_card)
      this.track_gained_card(game_card.top_card)
      game_card.count -= 1
      if (game_card.count > 0) {
        game_card.top_card = _.first(game_card.stack)
      }
      this.gain_event()
      this.gain_reactions()
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
    this.game.turn.gained_cards.push(gained_card)
  }

  gain_destination(destination) {
    if (_.contains(this.gain_destination_cards, this.card_name)) {
      let gained_card = ClassCreator.create(this.card_name)
      return gained_card.destination()
    } else {
      return destination
    }
  }

  gain_event() {
    if (_.contains(this.gain_event_cards, this.card_name)) {
      let gained_card = ClassCreator.create(this.card_name)
      gained_card.gain_event(this)
    }
  }

  would_gain_reactions() {
    let reaction_processor = new ReactionProcessor(this.game, this.player_cards)
    reaction_processor.process_would_gain_reactions(this)
  }

  gain_reactions() {
    this.game.turn.gain_reaction_stack.push(this.card_name)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game, this.player_cards)
    _.each(ordered_player_cards, (player_cards) => {
      let reaction_processor = new ReactionProcessor(this.game, player_cards)
      reaction_processor.process_gain_reactions()
    })
    this.game.turn.gain_reaction_stack.pop()
  }

  update_log(card) {
    if (!this.buy || this.gain_from_game_cards) {
      let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gains ${CardView.render(card)}`
      if (this.destination === 'hand') {
        log_message += ', placing it in hand'
      } else if (this.destination === 'deck') {
        log_message += ', placing it on top of their deck'
      }
      this.game.log.push(log_message)
    }
  }

}
