Meteor.publish('game', function() {
  return GameModel.find()
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find()
})

Meteor.publish('turn_event', function() {
  return TurnEventModel.find()
})

Meteor.publish('players', function() {
  return Meteor.users.find()
})

Meteor.publish('proposal', function() {
  return ProposalModel.find({'players._id': this.userId})
})
