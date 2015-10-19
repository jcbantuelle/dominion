Meteor.publish('game', function() {
  return Games.find({'players._id': this.userId})
})

Meteor.publish('player_cards', function() {
  return PlayerCards.find({'player_id': this.userId})
})

Meteor.methods({
  sendGameMessage: function(message) {
    Streamy.sessionsForUsers(player_ids()).emit('game_message', {
      username: Meteor.user().username,
      message: message
    })
  }
})

function players() {
  return Games.findOne(Meteor.user().current_game).players
}

function player_ids() {
  return _.map(players(), function(player) {
    return player._id
  })
}
