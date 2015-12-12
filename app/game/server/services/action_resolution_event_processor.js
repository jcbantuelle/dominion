ActionResolutionEventProcessor = class ActionResolutionEventProcessor {

  static reserve_events() {
    return ['Coin Of The Realm']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_action_resolution_events()
  }

  find_action_resolution_events() {
    let reserve_events = _.filter(this.player_cards.tavern, function(card) {
      return _.contains(ActionResolutionEventProcessor.reserve_events(), card.name)
    })

    this.action_resolution_events = reserve_events
  }

  process() {
    if (!_.isEmpty(this.action_resolution_events)) {
      if (_.size(this.action_resolution_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve action events (leftmost will be first):',
          cards: this.action_resolution_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.action_resolution_events)
        turn_event_processor.process(ActionResolutionEventProcessor.event_order)
      } else {
        StartTurnEventProcessor.event_order(this.game, this.player_cards, _.pluck(this.action_resolution_events, 'name'), this.action_resolution_events)
      }
    }
  }

  static event_order(game, player_cards, event_name_order, events) {
    _.each(event_name_order, function(event_name) {
      let event_index = _.findIndex(events, function(event) {
        return event.name === event_name
      })
      let event = events.splice(event_index, 1)[0]
      let selected_event = ClassCreator.create(event.name)
      selected_event.reserve(game, player_cards)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
