BetweenTurnEventProcessor = class BetweenTurnEventProcessor {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.event_id = 6000
    this.find_between_turn_events()
  }

  find_between_turn_events() {
    this.between_turn_events = []

    if (this.game.turn.donate) {
      let donate = ClassCreator.create('Donate').to_h()
      donate.id = this.generate_event_id()
      this.between_turn_events.push(donate)
    }

    if (this.game.mountain_pass) {
      let mountain_pass = ClassCreator.create('Mountain Pass').to_h()
      mountain_pass.id = this.generate_event_id()
      mountain_pass.purchasing_player = this.game.mountain_pass
      this.between_turn_events.push(mountain_pass)
    }
  }

  process() {
    if (!_.isEmpty(this.between_turn_events)) {
      if (_.size(this.between_turn_events) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: this.game._id,
          player_id: this.player_cards.player_id,
          username: this.player_cards.username,
          type: 'sort_cards',
          instructions: 'Choose order to resolve between turn events (leftmost will be first):',
          cards: this.between_turn_events
        })
        let turn_event_processor = new TurnEventProcessor(this.game, this.player_cards, turn_event_id)
        turn_event_processor.process(BetweenTurnEventProcessor.event_order)
      } else {
        BetweenTurnEventProcessor.event_order(this.game, this.player_cards, this.between_turn_events)
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
      event_object.between_turn_event(game, player_cards, event)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
