ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
  }

  decline(decliners) {
    Proposals.remove(this.proposal._id)
    this.notify_players(decliners)
  }

  notify_players(decliners) {
    Streamy.groupEmit('decline', {decliners: decliners}, Streamy.userSockets(this.player_ids()))
  }

  player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player.id
    })
  }

}
