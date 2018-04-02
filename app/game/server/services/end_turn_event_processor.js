EndTurnEventProcessor = class EndTurnEventProcessor {

  static landmark_events() {
    return ['Baths']
  }

  static boon_events() {
    return ['The Rivers Gift']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_end_turn_events()
  }

  find_end_turn_events() {
    let landmark_events = _.filter(this.game.landmarks, (card) => {
      if (_.includes(EndTurnEventProcessor.landmark_events(), card.name)) {
        if (card.name === 'Baths') {
          return card.victory_tokens > 0 && _.size(this.game.turn.gained_cards) == 0
        } else {
          return false
        }
      } else {
        return false
      }
    })

    boons = []
    if (this.game.boons) {
      boons = boons.concat(this.game.boons)
    }
    if (this.game.druid_boons) {
      boons = boons.concat(this.game.druid_boons)
    }
    let boon_events = _.filter(boons, (card) => {
      if (_.includes(EndTurnEventProcessor.boon_events(), card.name)) {
        if (card.name === 'The Rivers Gift') {
          return this.game.river_gift
        } else {
          return false
        }
      } else {
        return false
      }
    })

    let faithful_hound_events = _.map(this.player_cards.faithful_hounds, function(card) {
      card.end_turn_event_type = 'Faithful Hound'
      return card
    })

    this.end_turn_events = landmark_events.concat(boon_events).concat(faithful_hound_events)
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
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.end_turn_events)
        turn_event_processor.process(EndTurnEventProcessor.event_order)
      } else {
        EndTurnEventProcessor.event_order(this.game, this.player_cards, _.map(this.end_turn_events, 'name'), this.end_turn_events)
      }
    }
  }

  static event_order(game, player_cards, event_name_order, events) {
    _.each(event_name_order, function(event_name) {
      let event_index = _.findIndex(events, function(event) {
        return event.name === event_name
      })
      let event = events.splice(event_index, 1)[0]
      if (event_name === 'Estate' && player_cards.tokens.estate) {
        event_name = 'InheritedEstate'
      }
      let selected_event = ClassCreator.create(event_name)
      if (event.end_turn_event_type === 'Faithful Hound') {
        delete event.end_turn_event_type
        selected_event.end_turn_event(game, player_cards, player_cards.faithful_hounds.pop())
      } else {
        selected_event.end_turn_event(game, player_cards)
      }
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
