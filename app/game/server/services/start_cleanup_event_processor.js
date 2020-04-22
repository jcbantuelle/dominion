StartCleanupEventProcessor = class StartCleanupEventProcessor {

  static in_play_events() {
    return ['Walled Village']
  }

  static aside_events() {
    return ['Encampment']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.find_start_cleanup_events()
  }

  find_start_cleanup_events() {
    this.start_cleanup_events = []

    _.each(this.player_cards.aside, (card) => {
      if (_.includes(StartCleanupEventProcessor.aside_events(), card.name)) {
        this.start_cleanup_events.push(card)
      }
    })

    _.each(this.player_cards.in_play, (card) => {
      if (_.includes(StartCleanupEventProcessor.in_play_events(), card.name)) {
        if (card.name === 'Walled Village') {
          actions_in_play = _.size(_.filter(this.player_cards.in_play, (card) => {
            return _.includes(_.words(card.types), 'action')
          }))
          if (actions_in_play < 3) {
            this.start_cleanup_events.push(card)
          }
        }
      }
    })
  }

  process() {
    if (!_.isEmpty(this.start_cleanup_events)) {
      if (_.size(this.start_cleanup_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve start of cleanup events (leftmost will be first):',
          cards: this.start_cleanup_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(StartCleanupEventProcessor.event_order)
      } else {
        StartCleanupEventProcessor.event_order(this.game, this.player_cards, this.start_cleanup_events)
      }
    }
  }

  static event_order(game, player_cards, ordered_events) {
    _.each(ordered_events, (event) => {
      let event_object = ClassCreator.create(event.name)
      event_object.start_cleanup_event(game, player_cards, event)
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
