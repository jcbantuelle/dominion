CardPlayer = class CardPlayer {

  constructor(game, player_cards, card_name, free_play = false) {
    this.card = ClassCreator.create(card_name)
    this.game = game
    this.player_cards = player_cards
    this.free_play = free_play
    this.card_index = _.findIndex(this.player_cards.hand, (card) => {
      return card.name === this.card.name()
    })
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
      let play_response = this.play_card(auto_update)
      if (play_response === 'duration') {
        this.mark_played_card_as_duration()
      } else if (play_response === 'permanent') {
        this.mark_played_card_as_permanent()
      }

      if (!this.free_play) {
        this.resolve_played_cards()
      }
      if (_.contains(_.words(this.card.types), 'action')) {
        this.action_resolution_events()
      }
      if (auto_update) {
        this.update_db()
      }
    }
  }

  play_card(auto_update = true) {
    if (_.contains(this.card.types(), 'action') && this.game.turn.player._id === this.player_cards.player_id) {
      this.game.turn.played_actions += 1
    }
    let result = this.card.play(this.game, this.player_cards, this)
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
      if (this.game.turn.phase == 'action' && _.contains(this.card.types(), 'treasure')) {
        this.game.turn.phase = 'treasure'
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
    let action_resolution_event_processor = new ActionResolutionEventProcessor(this.game, this.player_cards)
    action_resolution_event_processor.process()
  }

  use_action() {
    if (!this.free_play) {
      if (_.contains(this.card.types(), 'action')) {
        this.game.turn.actions -= 1
      }
    }
  }

  update_db() {
    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> plays ${CardView.render(this.card)}`)
  }

  is_playable() {
    return typeof this.card.play === 'function'
  }

  is_valid_play() {
    if (_.contains(this.card.types(), 'action')) {
      return this.is_valid_action()
    } else if (_.contains(this.card.types(), 'treasure')) {
      return this.is_valid_treasure()
    }
  }

  is_valid_action() {
    return this.game.turn.phase == 'action' && this.game.turn.actions > 0
  }

  is_valid_treasure() {
    return _.contains(['action', 'treasure'], this.game.turn.phase)
  }

  card_exists() {
    return this.card_index !== -1
  }

  mark_played_card_as_duration() {
    let duration_card_index = _.findIndex(this.player_cards.playing, (card) => {
      return card.name === this.card.name() && !card.processed
    })
    this.player_cards.playing[duration_card_index].destination = 'duration'
    this.player_cards.playing[duration_card_index].processed = true
  }

  mark_played_card_as_permanent() {
    let permanent_card_index = _.findIndex(this.player_cards.playing, (card) => {
      return card.name === this.card.name() && !card.processed
    })
    this.player_cards.playing[permanent_card_index].destination = 'permanent'
    this.player_cards.playing[permanent_card_index].processed = true
  }

}
