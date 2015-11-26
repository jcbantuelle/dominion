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
      this.process_duration_cards()
      this.update_db()
    }
  }

  update_db() {
    Games.update(this.game._id, this.game)
    if (this.player_cards._id !== this.next_player_cards._id) {
      PlayerCards.update(this.player_cards._id, this.player_cards)
    }
    PlayerCards.update(this.next_player_cards._id, this.next_player_cards)
  }

  clean_up_cards_in_play() {
    if (this.game.turn.schemes > 0) {
      let scheme_resolver = new SchemeResolver(this.game, this.player_cards)
      scheme_resolver.resolve()
    }
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'in_play')
    card_discarder.discard_all(false)
  }

  discard_hand() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'hand')
    card_discarder.discard_all(false)
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
      previous_player: this.game.turn.player
    }

    this.set_up_extra_turns()

    if (!_.isEmpty(this.game.extra_turns)) {
      this.process_extra_turns()
    } else {
      this.next_player_turn()
    }

    this.next_player_cards = this.find_next_player_cards()
    this.game.turn = this.new_turn
  }

  set_up_extra_turns() {
    if (this.game.turn.outpost && this.game.turn.previous_player._id !== this.game.turn.player._id) {
      if (_.isEmpty(this.game.extra_turns)) {
        let next_player_query = new NextPlayerQuery(this.game, this.game.turn.player._id)
        this.game.player_after_extra_turns = next_player_query.next_player()
      }
      this.game.extra_turns.push({type: 'Outpost', player: this.game.turn.player})
    }
  }

  process_extra_turns() {
    let extra_turn = this.game.extra_turns.shift()
    if (extra_turn.type === 'Outpost') {
      this.outpost_turn(extra_turn.player)
    }
  }

  find_next_player_cards() {
    if (this.new_turn.player._id === this.player_cards.player_id) {
      return this.player_cards
    } else {
      return PlayerCards.findOne({
        game_id: this.game._id,
        player_id: this.new_turn.player._id
      })
    }
  }

  outpost_turn(player) {
    this.new_turn.player = player
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.card_html('action duration', 'Outpost')} -</strong>`)
  }

  next_player_turn() {
    if (this.game.player_after_extra_turns) {
      this.new_turn.player = this.game.player_after_extra_turns
      delete this.game.player_after_extra_turns
    } else {
      let next_player_query = new NextPlayerQuery(this.game, this.game.turn.player._id)
      this.new_turn.player = next_player_query.next_player()
    }
    this.game.turn_number += 1
    this.game.log.push(`<strong>- ${this.new_turn.player.username}'s turn ${this.player_turn_number()} -</strong>`)
  }

  process_duration_cards() {
    this.process_duration_effects()
    if (_.size(this.next_player_cards.haven) > 0) {
      this.process_haven()
    }
  }

  process_duration_effects() {
    _.each(this.next_player_cards.duration, (player_card) => {
      let card = ClassCreator.create(player_card.name)
      if (typeof card.duration === 'function') {
        _.times(player_card.duration_effect_count, () => {
          card.duration(this.game, this.next_player_cards)
        })
      }
      delete player_card.duration_effect_count
      this.next_player_cards.in_play.push(player_card)
    })
    this.next_player_cards.duration = []
  }

  process_haven() {
    this.next_player_cards.hand = this.next_player_cards.hand.concat(this.next_player_cards.haven)
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.next_player_cards.username}</strong> puts ${_.size(this.next_player_cards.haven)} cards in hand from ${CardView.card_html('action duration', 'Haven')}`)
    this.next_player_cards.haven = []
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
