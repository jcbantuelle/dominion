EndTurnEventProcessor = class EndTurnEventProcessor {

  static landmark_events() {
    return ['Baths']
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

    let river_gift_events = _.map(this.game.turn.river_gifts, function(card) {
      card.end_turn_event_type = 'The Rivers Gift'
      return card
    })

    let faithful_hound_events = _.map(this.player_cards.faithful_hounds, function(card) {
      card.end_turn_event_type = 'Faithful Hound'
      return card
    })

    this.end_turn_events = landmark_events.concat(river_gift_events).concat(faithful_hound_events)
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

  static event_order(game, player_cards, ordered_events, events) {
    _.each(ordered_events, function(ordered_event) {
      let event_index = _.findIndex(events, function(event) {
        return event.id === ordered_event.id
      })
      let event = events.splice(event_index, 1)[0]
      let selected_event = ClassCreator.create(event.name)
      if (event.end_turn_event_type === 'Faithful Hound') {
        delete event.end_turn_event_type
        selected_event.end_turn_event(game, player_cards, player_cards.faithful_hounds.pop())
      } else if (event.end_turn_event_type === 'The Rivers Gift') {
        let target_player_cards = player_cards
        if (event.target_player_id !== player_cards.player_id) {
          let all_player_cards = PlayerCardsModel.find(game._id)
          target_player_cards = _.find(all_player_cards, function(player_cards) {
            return player_cards.player_id === event.target_player_id
          })
        }
        delete event.target_player_id
        delete event.end_turn_event_type
        selected_event.end_turn_event(game, target_player_cards)
        PlayerCardsModel.update(game._id, target_player_cards)
      } else {
        selected_event.end_turn_event(game, player_cards)
      }
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)
    })
  }

}
