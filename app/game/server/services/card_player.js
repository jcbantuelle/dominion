CardPlayer = class CardPlayer {

  constructor(game, player_cards, card_name, free_play = false, misfit = false) {
    if (card_name === 'Estate' && player_cards.tokens.estate) {
      card_name = 'InheritedEstate'
    }
    this.card = ClassCreator.create(card_name)
    this.game = game
    this.player_cards = player_cards
    this.free_play = free_play
    this.card_index = _.findIndex(this.player_cards.hand, (card) => {
      return card.name === this.card.name() && (!misfit || card.misfit)
    })
    this.resolve = !this.free_play || this.player_cards.hand[this.card_index].prince
  }

  play(auto_update = true) {
    if (this.free_play || this.can_play()) {
      if (!this.free_play) {
        this.update_phase()
      }
      this.put_card_in_play()
      this.use_action()
      if (auto_update) {
        this.update_log()
        this.update_db()
      }
      this.play_response = this.play_card(auto_update)
      if (this.play_response === 'duration') {
        this.mark_played_card_as_duration()
      } else if (this.play_response === 'permanent') {
        this.mark_played_card_as_permanent()
      }

      if (_.includes(_.words(this.card.types), 'action')) {
        this.action_resolution_events()
      }
      if (this.resolve) {
        this.resolve_played_cards()
      }
      if (auto_update) {
        this.update_db()
      }
    }
  }

  token_effects() {
    _.each(this.player_cards.tokens.pile, (token) => {
      if (this.card.name() === token.card.name) {
        if (token.effect === 'card') {
          let card_drawer = new CardDrawer(this.game, this.player_cards)
          card_drawer.draw(1)
        } else if (token.effect === 'action') {
          this.game.turn.actions += 1
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +1 action`)
        } else if (token.effect === 'buy') {
          this.game.turn.buys += 1
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +1 buy`)
        } else if (token.effect === 'coin') {
          let gained_coins = CoinGainer.gain(this.game, this.player_cards, 1)
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +$${gained_coins}`)
        }
      }
    })
  }

  play_card(auto_update = true) {
    this.token_effects()
    if (_.includes(this.card.types(this.player_cards), 'action') && this.game.turn.player._id === this.player_cards.player_id) {
      this.game.turn.played_actions += 1
    }
    let result
    if (!this.game.turn.enchantress_attack && _.includes(this.card.types(this.player_cards), 'action') && _.includes(_.map(this.player_cards.duration_attacks, 'name'), 'Enchantress')) {
      this.game.turn.enchantress_attack = true
      let card_drawer = new CardDrawer(this.game, this.player_cards)
      card_drawer.draw(1, false)
      this.game.turn.actions += 1
      this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> gets +1 card and +1 action instead due to ${CardView.card_html('duration', 'Enchantress')}`)
    } else {
      result = this.card.play(this.game, this.player_cards, this)
    }
    if (auto_update) {
      this.update_db()
    }
    return result
  }

  can_play() {
    return this.is_playable() && this.is_valid_play() && this.card_exists()
  }

  update_phase() {
    if (!this.free_play) {
      if (this.game.turn.phase === 'action' && _.includes(this.card.types(this.player_cards), 'treasure')) {
        if (_.includes(this.card.types(this.player_cards), 'action') && this.game.turn.actions > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.game._id,
            player_id: this.player_cards.player_id,
            username: this.player_cards.username,
            type: 'choose_options',
            instructions: `Choose to play as an action or treasure:`,
            minimum: 1,
            maximum: 1,
            options: [
              {text: 'Action', value: 'action'},
              {text: 'Treasure', value: 'treasure'}
            ]
          })
          let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
          turn_event_processor.process(CardPlayer.action_or_treasure)
        } else {
          this.game.turn.phase = 'treasure'
        }
      }
    }
  }

  put_card_in_play() {
    played_card = this.player_cards.hand.splice(this.card_index, 1)
    this.player_cards.playing.push(played_card[0])
  }

  resolve_played_cards() {
    _.each(this.player_cards.playing, (card) => {
      let destination = card.destination
      delete card.processed
      delete card.destination
      if (destination) {
        this.player_cards[destination].push(card)
      } else {
        this.player_cards.in_play.push(card)
      }
    })
    this.player_cards.playing = []
  }

  action_resolution_events() {
    if (this.player_cards.champions > 0) {
      this.game.turn.actions += this.player_cards.champions
      this.game.log.push(`<strong>${this.player_cards.username}</strong> gets +${this.player_cards.champions} action(s) from ${CardView.card_html('action duration', 'Champion')}`)
    }
    let action_resolution_event_processor = new ActionResolutionEventProcessor(this.game, this.player_cards, this.card.to_h())
    action_resolution_event_processor.process()
  }

  use_action() {
    if (!this.free_play && this.game.turn.phase === 'action') {
      if (_.includes(this.card.types(this.player_cards), 'action')) {
        this.game.turn.actions -= 1
      }
    }
  }

  update_db() {
    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> plays ${CardView.render(this.card.to_h(this.player_cards))}`)
  }

  is_playable() {
    return typeof this.card.play === 'function'
  }

  is_valid_play() {
    if (_.includes(this.card.types(this.player_cards), 'treasure')) {
      return this.is_valid_treasure()
    } else if (_.includes(this.card.types(this.player_cards), 'action')) {
      return this.is_valid_action()
    }
  }

  is_valid_action() {
    return this.game.turn.phase == 'action' && this.game.turn.actions > 0
  }

  is_valid_treasure() {
    return _.includes(['action', 'treasure'], this.game.turn.phase)
  }

  card_exists() {
    return this.card_index !== -1
  }

  mark_played_card_as_duration() {
    let duration_card_index = _.findIndex(this.player_cards.playing, (card) => {
      return card.name === this.card.name() && !card.processed
    })
    if (duration_card_index !== -1) {
      this.player_cards.playing[duration_card_index].destination = 'duration'
      this.player_cards.playing[duration_card_index].processed = true
    }
  }

  mark_played_card_as_permanent() {
    let permanent_card_index = _.findIndex(this.player_cards.playing, (card) => {
      return card.name === this.card.name() && !card.processed
    })
    if (permanent_card_index !== -1) {
      this.player_cards.playing[permanent_card_index].destination = 'permanent'
      this.player_cards.playing[permanent_card_index].processed = true
    }
  }

  static action_or_treasure(game, player_cards, response) {
    if (response[0] === 'treasure') {
      game.turn.phase = 'treasure'
    }
  }

}
