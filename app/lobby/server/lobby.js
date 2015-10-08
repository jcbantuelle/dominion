Meteor.publish('lobby_players', function() {
  return Meteor.users.find({'status.online': true})
})
