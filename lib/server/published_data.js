Meteor.publish('games', function(game_id) {
  check(game_id, String)
  this.added("games", game_id, Games.get(game_id))
  Tracker.autorun(() => {
    let game = Games.get(game_id)
    if (game) {
      this.changed('games', game_id, game)
    } else {
      this.removed('games', game_id)
    }
  })
  this.ready()
})

Meteor.publish('player_cards', function() {
  return PlayerCardsModel.find()
})

Meteor.publish('turn_events', function(game_id) {
  this.added('turn_events', game_id, TurnEvents.get(game_id))
  Tracker.autorun(() => {
    let turn_event = TurnEvents.get(game_id)
    if (turn_event) {
      this.changed('turn_events', game_id, turn_event)
    } else {
      this.removed('turn_events', game_id)
      this.added('turn_events', game_id, turn_event)
    }
  })
  this.ready()
})

Meteor.publish('players', function() {
  return Meteor.users.find()
})

Meteor.publish('proposal', function() {
  return ProposalModel.find({'players._id': this.userId})
})
