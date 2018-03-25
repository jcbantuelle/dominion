Meteor.methods({
  proposeGame: function(player_ids, exclusions, kingdom_id, edition) {
    let game_proposer = new GameProposer(player_ids, exclusions, kingdom_id, edition)
    game_proposer.propose()
  },
  declineProposal: function(proposal_id) {
    let proposal_decliner = new ProposalDecliner(proposal_id)
    proposal_decliner.player_decline()
  },
  acceptProposal: function(proposal_id) {
    let proposal_accepter = new ProposalAccepter(proposal_id)
    proposal_accepter.accept_proposal()
  },
  setLobbyStatus: function() {
    Meteor.users.update(Meteor.userId(), {$set: {lobby: true}})
  },
  unsetLobbyStatus: function() {
    Meteor.users.update(Meteor.userId(), {$unset: {lobby: ''}})
  }
})
