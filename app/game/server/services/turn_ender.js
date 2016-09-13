TurnEnder = class TurnEnder {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  end_turn() {
    this.end_buy_events()
    this.game.turn.phase = 'cleanup'
    this.discard_hand()
    this.clean_up_cards_in_play()
    this.end_turn_events()
    this.draw_new_hand()
    this.track_gained_cards()
    this.game.log.push(`<strong>${this.game.turn.player.username}</strong> ends their turn`)
    if (this.game_over()) {
      this.end_game()
    } else {
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
      if (this.game.turn.possessed) {
        delete this.game.turn.possessed
        GameModel.update(this.game._id, this.game)
      }
      this.donate()
      this.mountain_pass()
      this.set_next_turn()
      this.clear_duration_attacks()
      GameModel.update(this.game._id, this.game)
      this.start_turn_events()
      this.move_duration_cards()
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

  end_buy_events() {
    let end_buy_event_processor = new EndBuyEventProcessor(this.game, this.player_cards)
    end_buy_event_processor.process()
  }

  end_turn_events() {
    let end_turn_event_processor = new EndTurnEventProcessor(this.game, this.player_cards)
    end_turn_event_processor.process()
  }

  clean_up_cards_in_play() {
    let walled_villages = _.filter(this.player_cards.in_play, function(card) {
      return card.name === 'Walled Village'
    })
    if (!_.isEmpty(walled_villages)) {
      WalledVillageResolver.resolve(this.game, this.player_cards, walled_villages)
    }
    if (!_.isEmpty(this.player_cards.encampments)) {
      _.each(this.player_cards.encampments, (encampment) => {
        let stack_name = encampment.misfit ? encampment.misfit.stack_name : encampment.stack_name
        let encampment_stack = _.find(this.game.cards, function(card) {
          return card.stack_name === stack_name
        })
        if (encampment_stack) {
          delete encampment.scheme
          delete encampment.prince
          if (encampment.misfit) {
            encampment = encampment.misfit
          }
          encampment_stack.count += 1
          encampment_stack.stack.unshift(encampment)
          encampment_stack.top_card = _.head(encampment_stack.stack)
          this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> returns ${CardView.render(encampment)} to the supply`)
        }
      })
      this.player_cards.encampments = []
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

    if (this.player_cards.champions > 0) {
      this.player_cards.champion = true
    }
  }

  discard_hand() {
    let card_discarder = new CardDiscarder(this.game, this.player_cards, 'hand')
    card_discarder.discard(false)
  }

  draw_new_hand() {
    let cards_to_draw = this.game.turn.outpost ? 3 : 5
    cards_to_draw += (this.game.turn.expeditions * 2)
    let card_drawer = new CardDrawer(this.game, this.player_cards)
    card_drawer.draw(cards_to_draw, false)
    if (!_.isEmpty(this.player_cards.save)) {
      this.player_cards.hand = this.player_cards.hand.concat(this.player_cards.save)
      this.player_cards.save = []
      this.game.log.push(`<strong>${this.player_cards.username}</strong> puts thier set aside card in hand from ${CardView.card_html('event', 'Save')}`)
    }
  }

  track_gained_cards() {
    this.player_cards.last_turn_gained_cards = this.game.turn.gained_cards
  }

  donate() {
    if (this.game.turn.donate) {
      this.player_cards.hand = this.player_cards.hand.concat(this.player_cards.discard).concat(this.player_cards.deck)
      this.player_cards.discard = []
      this.player_cards.deck = []
      if (_.size(this.player_cards.hand) > 0) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose any number of cards to trash:',
          cards: this.player_cards.hand,
          minimum: 0,
          maximum: 0
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(TurnEnder.trash_cards)
      } else {
        this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> has no cards to trash from ${CardView.card_html('event', 'Donate')}`)
      }
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  mountain_pass() {
    if (this.game.mountain_pass) {
      PlayerCardsModel.update(this.game._id, this.player_cards)
      let mountain_pass = new MountainPass()
      mountain_pass.start_bid(this.game)
      this.player_cards = PlayerCardsModel.findOne(this.game._id, this.player_cards.player_id)
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses not to trash anything from ${CardView.card_html('event', 'Donate')}`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.map(selected_cards, 'name'))
      card_trasher.trash()
    }
    player_cards.deck = _.shuffle(player_cards.hand)
    player_cards.hand = []
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(5, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> shuffles their hand into their deck and draws a new hand`)
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
      forbidden_events: [],
      schemes: 0,
      possessions: 0,
      coin_discount: 0,
      played_actions: 0,
      coppersmiths: 0,
      expeditions: 0,
      charms: 0,
      previous_player: this.game.turn.player
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
    if (this.game.turn.previous_player && this.game.turn.previous_player._id !== this.game.turn.player._id) {
      if (this.game.turn.outpost) {
        queued_turns.push(ClassCreator.create('Outpost').to_h())
      }
      if (this.game.turn.mission) {
        queued_turns.push(ClassCreator.create('Mission').to_h())
      }
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
      return turn === 'Possession'
    })
    _.each(ordered_extra_turns, function(turn, turn_index) {
      if (turn !== 'Possession') {
        let next_extra_turn = {type: turn, player: game.turn.player}
        if (turn_index < possession_index) {
          let possession_turn_index = _.findIndex(game.extra_turns, function(extra_turn) {
            return extra_turn.type === 'Possession'
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
    if (extra_turn.type === 'Mission' && this.game.turn.previous_player._id === this.game.turn.player._id) {
      if (!_.isEmpty(this.game.extra_turns)) {
        this.process_extra_turns()
      } else {
        this.next_player_turn()
      }
    } else {
      if (extra_turn.type === 'Outpost') {
        this.outpost_turn(extra_turn.player)
      } else if (extra_turn.type === 'Mission') {
        this.mission_turn(extra_turn.player)
      } else if (extra_turn.type === 'Possession') {
        this.possession_turn(extra_turn.player)
      }
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

  mission_turn(player) {
    this.new_turn.player = player
    this.new_turn.extra_turn = true
    this.new_turn.mission_turn = true
    this.game.log.push(`<strong>- ${this.new_turn.player.username} gets an extra turn from ${CardView.card_html('event', 'Mission')} -</strong>`)
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
    if (!_.isEmpty(this.next_player_cards.duration)) {
      let archive_effect_count = _.size(_.filter(this.next_player_cards.duration_effects, function(effect) {
        return effect.name === 'Archive'
      }))
      let duration_cards_to_move = []
      let duration_cards_remaining = []
      _.each(this.next_player_cards.duration, function(card) {
        delete card.prince
        if (card.name === 'Archive' && archive_effect_count > 0) {
          duration_cards_remaining.push(card)
          archive_effect_count -= 1
        } else {
          duration_cards_to_move.push(card)
        }
      })
      this.next_player_cards.in_play = this.next_player_cards.in_play.concat(duration_cards_to_move)
      this.next_player_cards.duration = duration_cards_remaining
    }
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
