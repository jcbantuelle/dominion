StartCleanupEventProcessor = class StartCleanupEventProcessor {

  static in_play_events() {
    return ['Walled Village']
  }

  static aside_events() {
    return ['Encampment']
  }

  constructor(game, player_cards) {
    this.game = game
    this.event_id = 8000
    this.player_cards = player_cards
    this.cards_to_discard = _.filter(this.player_cards.in_play, (card) => {
      return !ClassCreator.create(card.name).stay_in_play(this.game, this.player_cards, card)
    })
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
          let actions_in_play = _.size(_.filter(this.player_cards.in_play, (card) => {
            return _.includes(_.words(card.types), 'action')
          }))
          if (actions_in_play < (3 + this.game.turn.improves)) {
            this.start_cleanup_events.push(card)
          }
        }
      }
    })

    let actions_to_discard = _.filter(this.cards_to_discard, (card) => {
      return _.includes(_.words(card.types), 'action')
    })
    if (actions_to_discard) {
      _.times(this.game.turn.improves, () => {
        let improve = ClassCreator.create('Improve').to_h()
        improve.id = this.generate_event_id()
        this.start_cleanup_events.push(improve)
      })
    }
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

  generate_event_id() {
    let event_id = _.toString(this.event_id)
    this.event_id += 1
    return event_id
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
