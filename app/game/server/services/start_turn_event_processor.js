StartTurnEventProcessor = class StartTurnEventProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_start_turn_events()
  }

  find_start_turn_events() {
    let horse_traders_events = _.map(this.player_cards.horse_traders, function(card) {
      card.start_event_type = 'Horse Traders'
      return card
    })

    let duration_events = _.map(this.player_cards.duration_effects, function(card) {
      card.start_event_type = 'Duration'
      return card
    })

    this.start_turn_events = horse_traders_events.concat(duration_events)
  }

  process() {
    if (_.size(this.start_turn_events) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: this.game._id,
        player_id: this.player_cards.player_id,
        username: this.player_cards.username,
        type: 'sort_cards',
        instructions: 'Choose order to resolve start of turn events (leftmost will be first):',
        cards: this.start_turn_events
      })
      let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id, this.start_turn_events)
      turn_event_processor.process(StartTurnEventProcessor.event_order)
    } else {
      StartTurnEventProcessor.event_order(this.game, this.player_cards, _.pluck(this.start_turn_events, 'name'), this.start_turn_events)
    }

    this.player_cards.duration_effects = []
  }

  static event_order(game, player_cards, event_name_order, events) {
    _.each(event_name_order, function(event_name) {
      let event_index = _.findIndex(events, function(event) {
        return event.name === event_name
      })
      let event = events.splice(event_index, 1)[0]
      let selected_event = ClassCreator.create(event.name)
      if (event.start_event_type === 'Horse Traders') {
        selected_event.start_turn_event(game, player_cards, player_cards.horse_traders.pop())
      } else if (event.start_event_type === 'Duration') {
        selected_event.duration(game, player_cards, event)
      }
    })
  }

}
