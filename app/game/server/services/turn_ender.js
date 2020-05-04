TurnEnder = class TurnEnder {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  end_turn() {
    this.game.previous_state = false
    if (this.game.turn.phase === 'action') {
      this.start_buy_events()
    }
    this.end_buy_events()
    this.game.turn.phase = 'cleanup'
    this.start_cleanup_events()
    this.discard_hand()
    this.clean_up_cards_in_play()
    this.draw_new_hand()
    this.end_turn_events()
    this.track_turn_cards()
    this.game.log.push(`<strong>${this.game.turn.player.username}</strong> ends their turn`)
    if (!_.isEmpty(this.player_cards.inheritance)) {
      Inheritance.convert_estates(this.game, this.player_cards, false)
    }
    if (this.player_cards.capitalism) {
      Capitalism.convert_cards(this.game, this.player_cards, false)
    }
    if (this.game.game_over) {
      delete this.player_cards.fleet
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
    if (this.game_over()) {
      this.end_game()
    } else {
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
      if (this.game.turn.possessed) {
        delete this.game.turn.possessed
        GameModel.update(this.game._id, this.game)
      }
      this.flip_trash_cards_face_up()
      this.between_turn_events()
      this.set_next_turn()
      this.clear_duration_attacks()
      GameModel.update(this.game._id, this.game)
      if (!_.isEmpty(this.next_player_cards.inheritance)) {
        Inheritance.convert_estates(this.game, this.next_player_cards, true)
      }
      if (this.next_player_cards.capitalism) {
        Capitalism.convert_cards(this.game, this.next_player_cards, true)
      }
      this.start_turn_events()
      this.update_db(false)
    }
  }

  update_db(update_current_player = true) {
    GameModel.update(this.game._id, this.game)
    if (this.player_cards._id !== this.next_player_cards._id && update_current_player) {
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
    PlayerCardsModel.update(this.game._id, this.next_player_cards)
  }

  start_buy_events() {
    this.game.turn.phase = 'treasure'
    let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
    start_buy_event_processor.process()
    this.game.turn.phase = 'buy'
  }

  end_buy_events() {
    let end_buy_event_processor = new EndBuyEventProcessor(this.game, this.player_cards)
    end_buy_event_processor.process()
  }

  start_cleanup_events() {
    let start_cleanup_event_processor = new StartCleanupEventProcessor(this.game, this.player_cards)
    start_cleanup_event_processor.process()
  }

  end_turn_events() {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game)
    ordered_player_cards.shift()
    ordered_player_cards.unshift(this.player_cards)
    _.each(ordered_player_cards, (player_cards) => {
      let end_turn_event_processor = new EndTurnEventProcessor(this.game, player_cards)
      end_turn_event_processor.process()
    })
  }

  between_turn_events() {
    let between_turn_event_processor = new BetweenTurnEventProcessor(this.game, this.player_cards)
    between_turn_event_processor.process()
  }

  flip_trash_cards_face_up() {
    _.each(this.game.trash, function(card) {
      delete card.face_down
    })
  }

  clean_up_cards_in_play() {
    let cards_to_discard = _.filter(this.player_cards.in_play, (card) => {
      return !ClassCreator.create(card.name).stay_in_play(this.game, this.player_cards, card)
    })
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'in_play', cards_to_discard)
    card_discarder.discard(false)
    Prince.unset_prince_tracking(this.game, this.player_cards)

    if (this.game.turn.possessed && !_.isEmpty(this.player_cards.possession_trash)) {
      this.player_cards.discard = this.player_cards.discard.concat(this.player_cards.possession_trash)
      this.game.log.push(`<strong>${this.player_cards.username}</strong> puts ${CardView.render(this.player_cards.possession_trash)} in their discard`)
      this.player_cards.possession_trash = []
    }

    let card_mover = new CardMover(this.game, this.player_cards)
    card_mover.move_all(this.player_cards.boons, this.game.boons_discard)
  }

  discard_hand() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'hand')
    card_discarder.discard(false)
  }

  draw_new_hand() {
    let flag = _.find(this.player_cards.artifacts, (artifact) => {
      return artifact.name === 'Flag'
    })
    let cards_to_draw = this.game.turn.outpost ? 3 : 5
    if (flag) {
      cards_to_draw += 1
    }
    let card_drawer = new CardDrawer(this.game, this.player_cards)
    card_drawer.draw(cards_to_draw, false)
  }

  track_turn_cards() {
    this.player_cards.last_turn_gained_cards = this.game.turn.gained_cards
    this.player_cards.last_turn_trashed_cards = this.game.turn.trashed_cards
  }

  set_next_turn() {
    this.new_turn = GameCreator.new_turn()
    this.new_turn.previous_player = this.game.turn.player

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

  clear_duration_attacks() {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game)
    _.each(ordered_player_cards, (player_cards) => {
      if (player_cards.player_id === this.player_cards.player_id) {
        player_cards = this.player_cards
      } else if (player_cards.player_id === this.next_player_cards.player_id) {
        player_cards = this.next_player_cards
      }
      player_cards.duration_attacks = _.reject(player_cards.duration_attacks, (attack) => {
        return attack.player_source._id === this.next_player_cards.player_id
      })
      PlayerCardsModel.update(this.game._id, player_cards)
    })
  }

  set_up_extra_turns() {
    this.set_up_extra_player_turns()
    this.set_up_possession_turns()
    this.set_player_after_extra_turns(this.game.turn.player)
  }

  set_up_extra_player_turns() {
    let queued_turns = []
    if (this.game.turn.outpost) {
      queued_turns.push(this.game.turn.outpost)
    }
    if (this.game.turn.mission) {
      queued_turns.push(this.game.turn.mission)
    }
    if (this.game.turn.seize_the_day) {
      queued_turns.push(this.game.turn.seize_the_day)
    }
    if (!_.isEmpty(queued_turns)) {
      if (this.is_possessed_next_turn()) {
        queued_turns.push(ClassCreator.create('Possession').to_h())
      }

      if (_.size(queued_turns) === 1) {
        this.game.extra_turns.push({type: queued_turns[0].name, player: this.game.turn.player})
      } else {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve extra turns: (leftmost will be first)',
          cards: queued_turns
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(TurnEnder.process_extra_player_turns_order)
      }
    }
  }

  set_up_possession_turns() {
    _.times(this.game.turn.possessions, () => {
      this.game.extra_turns.push({type: 'Possession', player: this.game.turn.player})
    })
  }

  is_possessed_next_turn() {
    let next_extra_turn = _.head(this.game.extra_turns)
    if (next_extra_turn && next_extra_turn.type === 'Possession') {
      let next_player_query = new NextPlayerQuery(this.game, next_extra_turn.player._id)
      return next_player_query.next_player()._id === this.game.turn.player._id
    } else {
      return false
    }
  }

  static process_extra_player_turns_order(game, player_cards, ordered_extra_turns) {
    ordered_extra_turns = ordered_extra_turns.reverse()
    let possession_index = _.findIndex(ordered_extra_turns, function(turn) {
      return turn.name === 'Possession'
    })
    _.each(ordered_extra_turns, function(turn, turn_index) {
      if (turn.name !== 'Possession') {
        let next_extra_turn = {type: turn.name, player: game.turn.player}
        if (turn_index < possession_index) {
          let possession_turn_index = _.findIndex(game.extra_turns, function(extra_turn) {
            return extra_turn.type.name === 'Possession'
          })
          game.extra_turns.splice(possession_turn_index + 1, 0, next_extra_turn)
        } else {
          game.extra_turns.unshift(next_extra_turn)
        }
      }
    })
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
    } else if (extra_turn.type === 'Mission') {
      this.mission_turn(extra_turn.player)
    } else if (extra_turn.type === 'Possession') {
      this.possession_turn(extra_turn.player)
    } else if (extra_turn.type === 'Seize The Day') {
      this.seize_the_day_turn(extra_turn.player)
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
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.render(new Outpost())} -</strong>`)
  }

  seize_the_day_turn(player) {
    this.new_turn.player = player
    this.new_turn.extra_turn = true
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.render(new SeizeTheDay())} -</strong>`)
  }

  mission_turn(player) {
    this.new_turn.player = player
    this.new_turn.extra_turn = true
    this.new_turn.mission_turn = true
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.render(new Mission())} -</strong>`)
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
    if (this.game.game_over) {
      this.game.log.push(`<strong>- ${this.new_turn.player.username} takes an extra turn from ${CardView.render(new Fleet())} -</strong>`)
    } else {
      this.game.log.push(`<strong>- ${this.new_turn.player.username}'s turn ${this.player_turn_number()} -</strong>`)
    }
  }

  start_turn_events() {
    let start_turn_event_processor = new StartTurnEventProcessor(this.game, this.next_player_cards)
    start_turn_event_processor.process()
  }

  player_turn_number() {
    return Math.floor((this.game.turn_number-1) / _.size(this.game.players)) + 1
  }

  end_game() {
    let game_ender = new GameEnder(this.game)
    game_ender.end_game()
  }

  game_over() {
    let end_game_trigger = this.game.game_over || this.three_empty_stacks() || this.no_more_provinces_or_colonies()
    let fleet_game = _.find(this.game.projects, (project) => {
      return project.name === 'Fleet'
    })
    if (end_game_trigger && fleet_game) {
      this.game.game_over = true
      let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game)
      let fleet_turns = _.filter(ordered_player_cards, (player_cards) => {
        return player_cards.fleet
      })
      this.game.fleet = !_.isEmpty(fleet_turns)
    }
    return end_game_trigger && !this.game.fleet
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
      return game_card.count === 0 && game_card.supply
    })
  }

}
