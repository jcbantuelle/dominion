CardPlayer = class CardPlayer {

  constructor(game, player_cards, card, originating_card) {
    this.game = game
    this.player_cards = player_cards
    this.card = card
    this.originating_card = originating_card
  }

  play_without_announcement() {
    this.play(false, true, 'hand', 1, false)
  }

  play(free_play = false, move_card = true, source = 'hand', number_of_times = 1, announce = true) {
    let duration = false
    _.times(number_of_times, (play_count) => {
      if (this.can_play(free_play)) {
        this.update_phase(free_play)
        this.put_card_in_play(source, move_card)
        this.use_action(free_play)
        if (announce) {
          this.update_log()
          this.update_db()
        }
        this.play_card_events()
        let play_result = this.play_card(announce)
        if (play_result === 'duration') {
          duration = true
        }
        this.action_resolution_events()
        if (announce) {
          this.update_db()
        }
      }
    })
    if (this.originating_card) {
      if (duration) {
        let belongs_to = _.clone(this.card)
        belongs_to.expect_in_play = move_card
        this.originating_card.belongs_to.push(belongs_to)
      }
      if (_.includes(_.words(this.originating_card.types), 'command')) {
        this.originating_card.belongs_to = this.originating_card.belongs_to.concat(this.card.belongs_to)
      }
    }
  }

  can_play(free_play) {
    return free_play || (this.is_playable() && this.is_valid_play())
  }

  is_playable() {
    return typeof this.card_object().play === 'function'
  }

  is_valid_play() {
    if (_.includes(_.words(this.card.types), 'night')) {
      return true
    } else if (_.includes(_.words(this.card.types), 'treasure')) {
      return this.is_valid_treasure()
    } else if (_.includes(_.words(this.card.types), 'action')) {
      return this.is_valid_action()
    }
  }

  is_valid_action() {
    return this.game.turn.phase == 'action' && this.game.turn.actions > 0
  }

  is_valid_treasure() {
    return _.includes(['action', 'treasure'], this.game.turn.phase)
  }

  update_phase(free_play) {
    if (!free_play) {
      let phase
      if (this.game.turn.phase === 'action' && _.includes(_.words(this.card.types), 'treasure')) {
        phase = 'treasure'
        if (_.includes(_.words(this.card.types), 'action') && this.game.turn.actions > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.game._id,
            player_id: this.player_cards.player_id,
            username: this.player_cards.username,
            type: 'choose_options',
            instructions: `Choose to play ${CardView.render(this.card)} as an action or treasure:`,
            minimum: 1,
            maximum: 1,
            options: [
              {text: 'Action', value: 'action'},
              {text: 'Treasure', value: 'treasure'}
            ]
          })
          let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
          phase = turn_event_processor.process(CardPlayer.choose_phase)
        }
        if (phase === 'treasure') {
          this.game.turn.phase = 'treasure'
          let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
          start_buy_event_processor.process()
        }
      } else if (this.game.turn.phase === 'action' && _.includes(_.words(this.card.types), 'night')) {
        phase = 'night'
        if (_.includes(_.words(this.card.types), 'action') && this.game.turn.actions > 0) {
          let turn_event_id = TurnEventModel.insert({
            game_id: this.game._id,
            player_id: this.player_cards.player_id,
            username: this.player_cards.username,
            type: 'choose_options',
            instructions: `Choose to play as an action or night card:`,
            minimum: 1,
            maximum: 1,
            options: [
              {text: 'Action', value: 'action'},
              {text: 'Night', value: 'night'}
            ]
          })
          let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
          phase = turn_event_processor.process(CardPlayer.choose_phase)
        }
        if (phase === 'night') {
          this.game.turn.phase = 'treasure'
          let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
          start_buy_event_processor.process()
          this.game.turn.phase = 'buy'
          let end_buy_event_processor = new EndBuyEventProcessor(this.game, this.player_cards)
          end_buy_event_processor.process()
          this.game.turn.phase = 'night'
        }
      } else if (this.game.turn.phase !== 'night' && _.includes(_.words(this.card.types), 'night')) {
        if (this.game.turn.phase === 'action') {
          this.game.turn.phase = 'treasure'
          let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
          start_buy_event_processor.process()
        }
        if (_.includes(['treasure', 'buy'], this.game.turn.phase)) {
          this.game.turn.phase = 'buy'
          let end_buy_event_processor = new EndBuyEventProcessor(this.game, this.player_cards)
          end_buy_event_processor.process()
        }
        this.game.turn.phase = 'night'
      }
    }
  }

  put_card_in_play(source, move_card) {
    if (move_card) {
      let card_mover = new CardMover(this.game, this.player_cards)
      card_mover.move(this.player_cards[source], this.player_cards.in_play, this.card)
    }
  }

  use_action(free_play) {
    if (!free_play && this.game.turn.phase === 'action' && _.includes(_.words(this.card.types), 'action')) {
      this.game.turn.actions -= 1
    }
  }

  update_log() {
    this.game.log.push(`<strong>${this.player_cards.username}</strong> plays ${CardView.render(this.card)}`)
  }

  update_db() {
    GameModel.update(this.game._id, this.game)
    PlayerCardsModel.update(this.game._id, this.player_cards)
  }

  play_card_events() {
    let play_card_event_processor = new PlayCardEventProcessor(this)
    play_card_event_processor.process()

    if (_.includes(_.words(this.card.types), 'attack')) {
      let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(this.game)
      ordered_player_cards.shift()
      _.each(ordered_player_cards, (attacked_player_cards) => {
        let attack_event_processor = new AttackEventProcessor(this.game, attacked_player_cards)
        attack_event_processor.process()
      })
    }
  }

  play_card(announce) {
    let play_result
    this.token_effects()
    if (_.includes(_.words(this.card.types), 'action') && this.game.turn.player._id === this.player_cards.player_id) {
      this.game.turn.played_actions.push(this.card)
    }
    if (this.enchantress_attack()) {
      this.replace_with_enchantress()
    } else {
      play_result = this.card_object().play(this.game, this.player_cards, this)
    }
    if (announce) {
      this.update_db()
    }
    return play_result
  }

  enchantress_attack() {
    return !this.game.turn.enchantress_attack && _.includes(_.words(this.card.types), 'action') && _.includes(_.map(this.player_cards.duration_attacks, 'name'), 'Enchantress')
  }

  replace_with_enchantress() {
    this.game.turn.enchantress_attack = true
    this.game.log.push(`&nbsp;&nbsp;<strong>${this.player_cards.username}</strong> does not follow the card instructions due to ${CardView.render(new Enchantress())}`)
    let card_drawer = new CardDrawer(this.game, this.player_cards)
    card_drawer.draw(1)
    let action_gainer = new ActionGainer(this.game, this.player_cards)
    action_gainer.gain(1)
  }

  token_effects() {
    _.each(this.player_cards.tokens.pile, (token) => {
      if (this.card.stack_name === token.card.stack_name) {
        if (token.effect === 'card') {
          let card_drawer = new CardDrawer(this.game, this.player_cards)
          card_drawer.draw(1)
        } else if (token.effect === 'action') {
          let action_gainer = new ActionGainer(this.game, this.player_cards)
          action_gainer.gain(1)
        } else if (token.effect === 'buy') {
          let buy_gainer = new BuyGainer(this.game, this.player_cards)
          buy_gainer.gain(1)
        } else if (token.effect === 'coin') {
          let coin_gainer = new CoinGainer(this.game, this.player_cards)
          coin_gainer.gain(1)
        }
      }
    })
  }

  action_resolution_events() {
    if (_.includes(_.words(this.card.types), 'action')) {
      if (this.player_cards.champions > 0) {
        let champion = new Champion()
        let action_gainer = new ActionGainer(this.game, this.player_cards, champion.to_h())
        action_gainer.gain(this.player_cards.champions)
      }
      let action_resolution_event_processor = new ActionResolutionEventProcessor(this.game, this.player_cards, this.card)
      action_resolution_event_processor.process()
    }
  }

  card_object() {
    return ClassCreator.create(this.card.name)
  }

  static choose_phase(game, player_cards, response, card_player) {
    return response[0]
  }

}
