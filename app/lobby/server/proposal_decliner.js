ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
  }

  playerDecline() {
    this.declined_players = [Meteor.user()]
    this.decline()
  }

  timeoutDecline() {
    this.declined_players = _.filter(this.proposal.players, function(player) {
      return !player.accepted
    })
    this.decline()
  }

  decline() {
    Proposals.remove(this.proposal._id)
    this.notify_players()
  }

  notify_players() {
    Streamy.groupEmit('decline', {decliners: this.declined_players}, Streamy.userSockets(this.player_ids()))
  }

  player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player.id
    })
  }

}
