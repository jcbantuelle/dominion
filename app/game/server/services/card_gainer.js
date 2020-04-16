CardGainer = class CardGainer {

  constructor(game, player_cards, destination, card_name, buy = false) {
    this.game = game
    this.player_cards = player_cards
    this.card_name = card_name
    let card_destination = ClassCreator.create(card_name).destination()
    this.destination = card_destination ? card_destination : destination
    this.buy = buy
  }

  gain(source = 'supply') {
    this.source = source
    this.would_gain_reactions()
    this.find_card_to_gain()
    if (this.gained_card) {
      if (this.game.turn.possessed) {
        this.set_possession_gain()
      }
      this.move_card()
      if (this.moved_card) {
        this.update_log()
        this.track_gained_card()
        PlayerCardsModel.update(this.game._id, this.player_cards)
        this.gain_events()
        return this.gained_card
      } else {
        return false
      }
    } else {
      return false
    }
  }

  find_card_to_gain() {
    if (this.source === 'supply') {
      this.supply_pile = _.find(this.game.cards, (card) => {
        return card.name === this.card_name
      })
      if (this.supply_pile && this.supply_pile.count > 0) {
        this.gained_card = this.supply_pile.top_card
      }
    } else {
      this.gained_card = _.find(this.source, (card) => {
        return card.name === this.card_name
      })
    }
  }

  set_possession_gain() {
    this.possessed_player_cards = this.player_cards
    this.player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
    this.destination = 'discard'
  }

  move_card() {
    let card_mover = new CardMover(this.game, this.player_cards)
    if (this.source === 'supply') {
      this.moved_card = card_mover.take_from_supply(this.player_cards[this.destination], this.gained_card.name)
    } else {
      this.moved_card = card_mover.move(this.source, this.player_cards[this.destination], this.gained_card)
    }
  }

  track_gained_card() {
    if (this.game.turn.player._id === this.player_cards.player_id && !this.game.turn.possessed) {
      this.game.turn.gained_cards.push(this.gained_card)
    }
    if (this.gained_card.name === 'Province' && !this.game.first_province) {
      this.game.first_province = true
      let has_mountain_pass = _.find(this.game.landmarks, (landmark) => {
        return landmark.name === 'Mountain Pass'
      })
      if (has_mountain_pass) {
        let player_cards = this.game.turn.possessed ? this.possessed_player_cards : this.player_cards
        this.game.mountain_pass = player_cards
      }
    }
  }

  gain_events() {
    this.game.turn.gain_event_stack.push(this.card_name)

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game, this.player_cards)
    _.each(ordered_player_cards, (player_cards) => {
      let gain_event_processor = new GainEventProcessor(this, player_cards)
      gain_event_processor.process()
    })

    this.game.turn.gain_event_stack.pop()
  }

  would_gain_reactions() {
    let would_gain_reaction_processor = new WouldGainReactionProcessor(this)
    would_gain_reaction_processor.process()
  }

  update_log() {
    if (!this.buy) {
      let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gains ${CardView.render(this.gained_card)}`
      if (this.game.turn.possessed && this.possessed_player_cards.username !== this.player_cards.username) {
        log_message += ` instead of ${this.possessed_player_cards.username}`
      }
      if (this.destination === 'hand') {
        log_message += ', placing it in hand'
      } else if (this.destination === 'deck') {
        log_message += ', placing it on top of their deck'
      } else if (this.destination === 'summon') {
        log_message += ', setting it aside'
      }
      this.game.log.push(log_message)
    }
  }

}
