TurnEventProcessor = class TurnEventProcessor {

  constructor(game, player_cards, turn_event_ids) {
    this.game = game
    this.player_cards = player_cards
    if (typeof turn_event_ids !== 'object') {
      this.turn_event_ids = [turn_event_ids]
    } else {
      this.turn_event_ids = turn_event_ids
    }
  }

  process(event_action) {
    return Q.all(_.map(this.turn_event_ids, (turn_event_id) => {
      TurnEventPromises[turn_event_id] = Q.defer()
      return TurnEventPromises[turn_event_id].promise.then(Meteor.bindEnvironment((response) => {
        event_action(this.game, this.player_cards, response)
        TurnEvents.remove(turn_event_id)
        delete TurnEventPromises[turn_event_id]
      }))
    }))
  }

}
