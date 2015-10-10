ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
  }

  decline() {
    Proposals.remove(this.proposal._id)
    this.notify_players()
  }

  notify_players() {
    Streamy.groupEmit('decline',
      {
        decliner: {
          id: Meteor.userId(),
          username: Meteor.user().username
        }
      },
      Streamy.userSockets(this.player_ids())
    )
  }

  player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player.id
    })
  }

}
