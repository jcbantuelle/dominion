Meteor.methods({
  proposeGame: function(player_ids, exclusions) {
    let game_proposer = new GameProposer(player_ids, exclusions)
    game_proposer.propose()
  },
  proposeGameFromKingdom: function(player_ids, exclusions, kingdom_id) {
    let game_proposer = new GameProposer(player_ids, exclusions)
    game_proposer.propose(kingdom_id)
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
