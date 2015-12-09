TurnEnder = class TurnEnder {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  end_turn() {
    this.game.turn.phase = 'cleanup'
    this.discard_hand()
    this.clean_up_cards_in_play()
    this.draw_new_hand()
    this.track_gained_cards()
    this.game.log.push(`<strong>${this.game.turn.player.username}</strong> ends their turn`)
    if (this.game_over()) {
      this.end_game()
    } else {
      this.set_next_turn()
      this.start_turn_events()
      this.move_duration_cards()
      this.update_db()
    }
  }

  update_db() {
    GameModel.update(this.game._id, this.game)
    if (this.player_cards._id !== this.next_player_cards._id) {
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
    PlayerCardsModel.update(this.game._id, this.next_player_cards)
  }

  clean_up_cards_in_play() {
    let walled_villages = _.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Walled Village'
    })
    if (!_.isEmpty(walled_villages)) {
      WalledVillageResolver.resolve(this.game, this.player_cards, walled_villages)
    }
    if (this.game.turn.schemes > 0) {
      SchemeChooser.choose(this.game, this.player_cards)
    }
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'in_play')
    card_discarder.discard(false)

    if (this.game.turn.possessed && !_.isEmpty(this.player_cards.possession_trash)) {
      this.player_cards.discard = this.player_cards.discard.concat(this.player_cards.possession_trash)
      this.game.log.push(`<strong>${this.player_cards.username}</strong> puts ${CardView.render(this.player_cards.possession_trash)} in their discard`)
      this.player_cards.possession_trash = []
    }
  }

  discard_hand() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'hand')
    card_discarder.discard(false)
  }

  draw_new_hand() {
    let cards_to_draw = this.game.turn.outpost ? 3 : 5
    let card_drawer = new CardDrawer(this.game, this.player_cards)
    card_drawer.draw(cards_to_draw, false)
  }

  track_gained_cards() {
    this.player_cards.last_turn_gained_cards = this.game.turn.gained_cards
  }

  set_next_turn() {
    this.new_turn = {
      actions: 1,
      buys: 1,
      coins: 0,
      potions: 0,
      phase: 'action',
      gained_cards: [],
      bought_cards: [],
      gain_event_stack: [],
      contraband: [],
      schemes: 0,
      possessions: 0,
      coin_discount: 0,
      played_actions: 0,
      coppersmiths: 0,
      previous_player: this.game.turn.player
    }

    if (this.game.turn.possessed) {
      delete this.game.turn.possessed
      GameModel.update(this.game._id, this.game)
    }

    this.set_up_extra_turns()

    if (!_.isEmpty(this.game.extra_turns)) {
      this.process_extra_turns()
    } else {
      this.next_player_turn()
    }

    this.next_player_cards = this.find_next_player_cards()
    if (!this.new_turn.extra_turn) {
      this.next_player_cards.turns += 1
    }
    this.game.turn = this.new_turn
  }

  set_up_extra_turns() {
    this.set_up_outpost_turn()
    this.set_up_possession_turns()
    this.set_player_after_extra_turns(this.game.turn.player)
  }

  set_up_outpost_turn() {
    if (this.game.turn.outpost && this.game.turn.previous_player._id !== this.game.turn.player._id) {
      if (this.is_possessed_next_turn()) {
        this.choose_outpost_or_possession()
      } else {
        this.game.extra_turns.push({type: 'Outpost', player: this.game.turn.player})
      }
    }
  }

  set_up_possession_turns() {
    _.times(this.game.turn.possessions, () => {
      this.game.extra_turns.push({type: 'Possession', player: this.game.turn.player})
    })
  }

  is_possessed_next_turn() {
    let next_extra_turn = _.first(this.game.extra_turns)
    if (next_extra_turn && next_extra_turn.type === 'Possession') {
      let next_player_query = new NextPlayerQuery(this.game, next_extra_turn.player._id)
      return next_player_query.next_player()._id === this.game.turn.player._id
    } else {
      return false
    }
  }

  choose_outpost_or_possession() {
    let turn_event_id = TurnEventModel.insert({
      game_id: this.game._id,
      player_id: this.player_cards.player_id,
      username: this.player_cards.username,
      type: 'choose_options',
      instructions: 'Take your outpost turn or get possessed first?',
      minimum: 1,
      maximum: 1,
      options: [
        {text: `${CardView.card_html('action duration', 'Outpost')}`, value: 'outpost'},
        {text: `${CardView.card_html('action', 'Possession')}`, value: 'possession'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
    turn_event_processor.process(TurnEnder.process_outpost_or_possession)
  }

  static process_outpost_or_possession(game, player_cards, response) {
    response = response[0]
    if (response === 'outpost') {
      game.extra_turns.unshift({type: 'Outpost', player: game.turn.player})
    } else if (response === 'possession') {
      game.extra_turns.splice(1, 0, {type: 'Outpost', player: game.turn.player})
    }
  }

  set_player_after_extra_turns(player) {
    if (!_.isEmpty(this.game.extra_turns) && !this.game.player_after_extra_turns) {
      let next_player_query = new NextPlayerQuery(this.game, player._id)
      this.game.player_after_extra_turns = next_player_query.next_player()
    }
  }

  process_extra_turns() {
    let extra_turn = this.game.extra_turns.shift()
    if (extra_turn.type === 'Outpost') {
      this.outpost_turn(extra_turn.player)
    } else if (extra_turn.type === 'Possession') {
      this.possession_turn(extra_turn.player)
    }
  }

  find_next_player_cards() {
    if (this.new_turn.player._id === this.player_cards.player_id) {
      return this.player_cards
    } else {
      return PlayerCardsModel.findOne(this.game._id, this.new_turn.player._id)
    }
  }

  outpost_turn(player) {
    this.new_turn.player = player
    this.new_turn.extra_turn = true
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.card_html('action duration', 'Outpost')} -</strong>`)
  }

  possession_turn(player) {
    let next_player_query = new NextPlayerQuery(this.game, player._id)
    this.new_turn.player = next_player_query.next_player()
    this.new_turn.possessed = player
    this.new_turn.extra_turn = true
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn possessed by ${this.new_turn.possessed.username} -</strong>`)
  }

  next_player_turn() {
    if (this.game.player_after_extra_turns) {
      this.new_turn.player = this.game.player_after_extra_turns
      delete this.game.player_after_extra_turns
    } else {
      let next_player_query = new NextPlayerQuery(this.game, this.game.turn.player._id)
      this.new_turn.player = next_player_query.next_player()
    }
    this.new_turn.extra_turn = false
    this.game.turn_number += 1
    this.game.log.push(`<strong>- ${this.new_turn.player.username}'s turn ${this.player_turn_number()} -</strong>`)
  }

  start_turn_events() {
    let start_turn_event_processor = new StartTurnEventProcessor(this.game, this.next_player_cards)
    start_turn_event_processor.process()
  }

  move_duration_cards() {
    let duration_cards = _.map(this.next_player_cards.duration, function(card) {
      delete card.prince
      return card
    })
    this.next_player_cards.in_play = this.next_player_cards.in_play.concat(duration_cards)
    this.next_player_cards.duration = []
  }

  player_turn_number() {
    return Math.floor((this.game.turn_number-1) / _.size(this.game.players)) + 1
  }

  end_game() {
    let game_ender = new GameEnder(this.game)
    game_ender.end_game()
  }

  game_over() {
    return this.three_empty_stacks() || this.no_more_provinces_or_colonies()
  }

  three_empty_stacks() {
    return _.size(this.empty_stacks()) >= 3
  }

  no_more_provinces_or_colonies() {
    return _.find(this.empty_stacks(), function(game_card) {
      return game_card.name === 'Province' || game_card.name === 'Colony'
    }) !== undefined
  }

  empty_stacks() {
    return _.filter(this.game.cards, function(game_card) {
      return game_card.count === 0 && game_card.top_card.purchasable
    })
  }

}
