Meteor.publish('lobby_players', function() {
  return Meteor.users.find({
    'status.online': true,
    current_game: {$exists: false}
  })
})

Meteor.publish('proposal', function() {
  return Proposals.find({'players._id': this.userId})
})

Meteor.publish('game', function() {
  return Games.find({'players._id': this.userId})
})

Meteor.methods({
  proposeGame: function(player_ids) {
    let game_proposer = new GameProposer(player_ids)
    game_proposer.propose()
  },
  declineProposal: function(proposal_id) {
    let proposal_decliner = new ProposalDecliner(proposal_id)
    proposal_decliner.player_decline()
  },
  acceptProposal: function(proposal_id) {
    let proposal_accepter = new ProposalAccepter(proposal_id)
    proposal_accepter.accept_proposal()
  }
})

