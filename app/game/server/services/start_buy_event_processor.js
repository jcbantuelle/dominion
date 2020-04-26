StartBuyEventProcessor = class StartBuyEventProcessor {

  static landmark_events() {
    return ['Arena']
  }

  static artifact_events() {
    return ['Treasure Chest']
  }

  static state_events() {
    return ['Deluded', 'Envious']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_start_buy_events()
  }

  find_start_buy_events() {
    let landmark_events = _.filter(this.game.landmarks, (card) => {
      if (_.includes(StartBuyEventProcessor.landmark_events(), card.name)) {
        if (card.name === 'Arena') {
          let has_actions = _.some(this.player_cards.hand, function(card) {
            return _.includes(_.words(card.types), 'action')
          })
          return has_actions
        } else {
          return false
        }
      } else {
        return false
      }
    })

    let state_events = _.filter(this.player_cards.states, function(card) {
      return _.includes(StartBuyEventProcessor.state_events(), card.name)
    })

    let artifact_events = _.filter(this.player_cards.artifacts, function(card) {
      return _.includes(StartBuyEventProcessor.artifact_events(), card.name)
    })
    this.start_buy_events = landmark_events.concat(state_events).concat(artifact_events)
  }

  process() {
    if (!_.isEmpty(this.start_buy_events)) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> starts their buy phase`)
      if (_.size(this.start_buy_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve start of buy phase events (leftmost will be first):',
          cards: this.start_buy_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.start_buy_events)
        turn_event_processor.process(StartBuyEventProcessor.event_order)
      } else {
        StartBuyEventProcessor.event_order(this.game, this.player_cards, _.map(this.start_buy_events, 'name'), this.start_buy_events)
      }
    }
  }

  static event_order(game, player_cards, ordered_events, events) {
    _.each(ordered_events, function(ordered_event) {
      let event_index = _.findIndex(events, function(event) {
        return event.id === ordered_event.id
      })
      let event = events.splice(event_index, 1)[0]
      let selected_event = ClassCreator.create(event.name)
      selected_event.start_buy_event(game, player_cards, event)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
