ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
    this.player_ids = this.find_player_ids()
  }

  player_decline() {
    this.declined_players = [Meteor.user()]
    this.decline()
  }

  timeout_decline() {
    this.declined_players = _.filter(this.proposal.players, function(player) {
      return !player.accepted
    })
    this.decline()
  }

  decline() {
    Proposals.remove(this.proposal._id)
    this.notify_players()
    this.update_players()
  }

  notify_players() {
    Streamy.sessionsForUsers(this.player_ids).emit('decline', {decliners: this.declined_players})
  }

  update_players() {
    _.each(this.player_ids, function(player_id) {
      Meteor.users.update(player_id, {
        $unset: {has_proposal: ''}
      })
    })
  }

  find_player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player._id
    })
  }

}
