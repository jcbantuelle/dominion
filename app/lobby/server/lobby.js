Meteor.publish('lobby_players', function() {
  return Meteor.users.find({
    'status.online': true,
    current_game: {$exists: false}
  })
})

Meteor.publish('proposal', function() {
  return Proposals.find({'players.id': this.userId})
})

Meteor.methods({
  proposeGame: function(player_ids) {
    proposal = Proposals.insert({
      proposer: {
        id: Meteor.userId(),
        username: Meteor.user().username
      },
      players: proposal_players(player_ids)
    })
  }
})

function proposal_players(player_ids) {
  player_ids.push(Meteor.userId())
  players = Meteor.users.find({_id: {$in: player_ids}})
  return players.map(function(player) {
    return {
      id: player._id,
      username: player.username
    }
  })
}
