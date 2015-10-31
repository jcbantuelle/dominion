Meteor.publish('game', function() {
  return Games.find({'players._id': this.userId})
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find({'player_id': this.userId})
})

Meteor.publish('turn_event', function() {
  return TurnEvents.find({'player_id': this.userId})
})

Meteor.publish('players', function() {
  return Meteor.users.find({
    'status.online': true,
    current_game: {$exists: false}
  })
})

Meteor.publish('proposal', function() {
  return Proposals.find({'players._id': this.userId})
})
