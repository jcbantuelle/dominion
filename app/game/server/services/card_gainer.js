CardGainer = class CardGainer {

  constructor(game, player_cards, destination, card_name, buy = false) {
    this.game = game
    this.player_cards = player_cards
    this.gain_destination_cards = ['Nomad Camp', 'Villa', 'Guardian', 'Ghost Town', 'Night Watchman', 'Den Of Sin']
    this.card_name = card_name
    this.destination = this.gain_destination(destination)
    this.buy = buy
  }

  gain_trash_card() {
    this.would_gain_reactions()
    if (this.gain_from_game_cards) {
      this.gain_game_card()
    } else {
      let card_index = this.find_card_index(this.game.trash)
      this.gained_card = this.game.trash[card_index]
      delete this.gained_card.face_down
      this.track_gained_card()
      if (this.game.turn.travelling_fair) {
        this.travelling_fair(this.gained_card)
      }
      this.possessed()
      this.player_cards[this.destination].unshift(this.gained_card)
      this.game.trash.splice(card_index, 1)
      this.groundskeepers()
      this.update_log()
      this.gain_events()
      this.update_cards()
    }
  }

  gain_black_market_card() {
    this.would_gain_reactions()
    if (this.gain_from_game_cards) {
      this.gain_game_card()
    } else {
      this.gained_card = this.game.black_market_bought_card
      this.track_gained_card()
      if (this.game.turn.travelling_fair) {
        this.travelling_fair(this.gained_card)
      }
      this.possessed()
      this.player_cards[this.destination].unshift(this.gained_card)
      delete this.game.black_market_bought_card
      this.groundskeepers()
      this.update_log()
      this.gain_events()
      this.update_cards()
    }
  }

  gain_prize_card() {
    this.would_gain_reactions()
    if (this.gain_from_game_cards) {
      this.gain_game_card()
    } else {
      let card_index = this.find_card_index(this.game.prizes)
      this.gained_card = this.game.prizes[card_index]
      this.track_gained_card()
      if (this.game.turn.travelling_fair) {
        this.travelling_fair(this.gained_card)
      }
      this.possessed()
      this.player_cards[this.destination].unshift(this.gained_card)
      this.game.prizes.splice(card_index, 1)
      this.groundskeepers()
      this.update_log()
      this.gain_events()
      this.update_cards()
    }
  }

  gain_game_card() {
    if (!this.gain_from_game_cards) {
      this.would_gain_reactions()
    }
    let game_card = this.find_card(this.game.cards)
    if (game_card && game_card.count > 0) {
      game_card.stack.shift()
      if (this.game.turn.travelling_fair) {
        this.travelling_fair(game_card)
      }
      this.possessed()
      this.gained_card = _.clone(game_card.top_card)
      this.convert_estate()
      this.player_cards[this.destination].unshift(this.gained_card)
      this.update_log()
      this.track_gained_card()
      game_card.count -= 1
      if (game_card.count > 0) {
        game_card.top_card = _.head(game_card.stack)
      }
      this.gain_events()
      this.groundskeepers()
      this.trade_route_token(game_card)
      this.update_cards()
      return this.gained_card
    } else {
      return false
    }
  }

  update_cards() {
    if (this.game.turn.possessed) {
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  possessed() {
    if (this.game.turn.possessed) {
      this.possessed_player = this.player_cards.username
      this.player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
      this.destination = 'discard'
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

  track_gained_card(gained_card) {
    if (this.game.turn.player._id === this.player_cards.player_id && !this.game.turn.possessed) {
      this.game.turn.gained_cards.push(this.gained_card)
    }
    if (this.gained_card.name === 'Province' && !this.game.first_province) {
      this.game.first_province = true
      let has_mountain_pass = _.find(this.game.landmarks, function(landmark) {
        return landmark.name === 'Mountain Pass'
      })
      if (has_mountain_pass) {
        this.game.mountain_pass = this.player_cards
      }
    }
  }

  gain_destination(destination) {
    if (_.includes(this.gain_destination_cards, this.card_name)) {
      let gained_card = ClassCreator.create(this.card_name)
      return gained_card.destination()
    } else if (this.card_name === 'Estate' && this.player_cards.tokens.estate && _.includes(this.gain_destination_cards, this.player_cards.tokens.estate.name)) {
      let gained_card = ClassCreator.create(this.player_cards.tokens.estate.name)
      return gained_card.destination()
    } else {
      return destination
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

  trade_route_token(game_card) {
    if (game_card.has_trade_route_token) {
      game_card.has_trade_route_token = false
      this.game.trade_route_tokens += 1
    }
  }

  travelling_fair(gained_card) {
    let turn_event_id = TurnEventModel.insert({
      game_id: this.game._id,
      player_id: this.player_cards.player_id,
      username: this.player_cards.username,
      type: 'choose_yes_no',
      instructions: `Put ${CardView.render(gained_card)} on top of your deck?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this)
    turn_event_processor.process(CardGainer.put_card_on_deck)
  }

  update_log() {
    if (!this.buy || this.gain_from_game_cards) {
      let log_message = `&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gains ${CardView.render(this.gained_card)}`
      if (this.game.turn.possessed && this.possessed_player !== this.player_cards.username) {
        log_message += ` instead of ${this.possessed_player}`
      }
      if (this.destination === 'hand') {
        log_message += ', placing it in hand'
      } else if (this.destination === 'deck') {
        log_message += ', placing it on top of their deck'
      } else if (this.destination === 'summon') {
        log_message += ', setting it aside'
      }
      this.game.log.push(log_message)
    } else if (this.buy && this.game.turn.travelling_fair && !this.game.turn.possessed && this.destination === 'deck') {
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> places the card on top of their deck from ${CardView.render(new TravellingFair())}`)
    }
  }

  groundskeepers() {
    if (_.includes(_.words(this.gained_card.types), 'victory')) {
      let groundskeeper_count = _.size(_.filter(this.player_cards.in_play, function(card) {
        return card.name === 'Groundskeeper'
      }))
      if (groundskeeper_count > 0) {
        if (this.game.turn.possessed) {
          possessing_player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.possessed._id)
          possessing_player_cards.victory_tokens += groundskeeper_count
          this.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${groundskeeper_count} &nabla; from ${CardView.render(new Groundskeeper())}`)
          PlayerCardsModel.update(this.game._id, possessing_player_cards)
        } else {
          this.player_cards.victory_tokens += groundskeeper_count
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +${groundskeeper_count} &nabla; from ${CardView.render(new Groundskeeper())}`)
        }
      }
    }
  }

  static put_card_on_deck(game, player_cards, response, gainer) {
    if (response === 'yes') {
      gainer.destination = 'deck'
    }
  }

}
