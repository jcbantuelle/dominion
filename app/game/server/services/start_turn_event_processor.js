StartTurnEventProcessor = class StartTurnEventProcessor {

  static reserve_events() {
    return ['Teacher', 'Ratcatcher', 'Guide', 'Transmogrify']
  }

  static state_events() {
    return ['Lost In The Woods']
  }

  static artifact_events() {
    return ['Key']
  }

  static project_events() {
    return ['Cathedral', 'City Gate', 'Fair', 'Silos', 'Sinister Plot', 'Piazza']
  }

  static aside_events() {
    return ['Horse Traders', 'Prince']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_id = 4000
    this.find_start_turn_events()
  }

  find_start_turn_events() {
    this.start_turn_events = []

    _.each(this.player_cards.aside, (card) => {
      if (_.includes(StartTurnEventProcessor.aside_events(), card.name)) {
        if (card.name === 'Prince') {
          if (card.target) {
            this.start_turn_events.push(card)
          }
        } else {
          this.start_turn_events.push(card)
        }
      }
    })

    _.each(this.player_cards.duration_effects, (duration_effect) => {
      let effect = _.clone(duration_effect)
      effect.event_type = 'Duration'
      this.start_turn_events.push(effect)
    })

    _.each(this.player_cards.start_turn_event_effects, (event_effect) => {
      event_effect.event_type = 'Event'
      if (!event_effect.id) {
        event_effect.id = this.generate_event_id()
      }
      this.start_turn_events.push(event_effect)
    })

    _.each(this.player_cards.tavern, (card) => {
      if (_.includes(StartTurnEventProcessor.reserve_events(), card.name)) {
        let reserve = _.clone(card)
        reserve.event_type = 'Reserve'
        this.start_turn_events.push(reserve)
      }
    })

    _.each(this.player_cards.states, (card) => {
      if (_.includes(StartTurnEventProcessor.state_events(), card.name)) {
        this.start_turn_events.push(card)
      }
    })

    _.each(this.player_cards.artifacts, (card) => {
      if (_.includes(StartTurnEventProcessor.artifact_events(), card.name)) {
        this.start_turn_events.push(card)
      }
    })

    _.each(this.player_cards.projects, (card) => {
      if (_.includes(StartTurnEventProcessor.project_events(), card.name)) {
        this.start_turn_events.push(card)
      }
    })
  }

  process() {
    if (!_.isEmpty(this.start_turn_events)) {
      if (_.size(this.start_turn_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve start of turn events (leftmost will be first):',
          cards: this.start_turn_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(StartTurnEventProcessor.event_order)
      } else {
        StartTurnEventProcessor.event_order(this.game, this.player_cards, this.start_turn_events)
      }
    }
  }

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
  }

  static event_order(game, player_cards, ordered_events) {
    _.each(ordered_events, function(event) {
      let event_object = ClassCreator.create(event.name)
      if (event.event_type === 'Duration') {
        let duration_effect_index = _.findIndex(player_cards.duration_effects, function(duration_effect) {
          return duration_effect.id === event.id
        })
        player_cards.duration_effects.splice(duration_effect_index, 1)
        event_object.duration(game, player_cards, event)
      } else if (event.event_type === 'Event') {
        let event_effect_index = _.findIndex(player_cards.start_turn_event_effects, function(event_effect) {
          return event_effect.id === event.id
        })
        player_cards.start_turn_event_effects.splice(event_effect_index, 1)
        event_object.start_turn_event(game, player_cards, event)
      } else if (event.event_type === 'Reserve') {
        event_object.reserve(game, player_cards, event)
      } else {
        event_object.start_turn_event(game, player_cards, event)
      }
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
