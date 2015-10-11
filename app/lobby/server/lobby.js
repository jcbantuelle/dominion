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
    let game_proposer = new GameProposer(player_ids)
    game_proposer.propose()
  },
  declineProposal: function(proposal_id) {
    let proposal_decliner = new ProposalDecliner(proposal_id)
    proposal_decliner.playerDecline()
  }
})

