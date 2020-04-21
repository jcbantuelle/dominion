EndTurnEventProcessor = class EndTurnEventProcessor {

  static landmark_events() {
    return ['Baths']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_id = 5000
    this.find_end_turn_events()
  }

  find_end_turn_events() {
    this.end_turn_events = []

    _.each(this.game.landmarks, (card) => {
      if (_.includes(EndTurnEventProcessor.landmark_events(), card.name)) {
        if (card.name === 'Baths') {
          if (card.victory_tokens > 0 && _.size(this.game.turn.gained_cards) == 0) {
            this.end_turn_events.push(card)
          }
        }
      }
    })

    _.each(this.player_cards.event_effects, (event_effect) => {
      event_effect.event_type = 'Event'
      event_effect.id = this.generate_event_id()
      this.end_turn_events.push(event_effect)
    })
  }

  process() {
    if (!_.isEmpty(this.end_turn_events)) {
      if (_.size(this.end_turn_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve end of turn events (leftmost will be first):',
          cards: this.end_turn_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(EndTurnEventProcessor.event_order)
      } else {
        EndTurnEventProcessor.event_order(this.game, this.player_cards, this.end_turn_events)
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
      if (event.event_type === 'Event') {
        let event_effect_index = _.findIndex(player_cards.event_effects, function(event_effect) {
          return event_effect.id === event.id
        })
        player_cards.event_effects.splice(event_effect_index, 1)
      }
      event_object.end_turn_event(game, player_cards, event)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
