ProposalDecliner = class ProposalDecliner {

  constructor(proposal_id) {
    this.proposal = Proposals.findOne(proposal_id)
    this.player_ids = this.find_player_ids()
    this.player_sockets = this.find_player_sockets()
  }

  decline() {
    Proposals.remove(this.proposal._id)
    this.notify_players()
  }

  notify_players() {
    _.each(this.player_sockets, this.send_decline)
  }

  send_decline(socket) {
    Streamy.emit('decline', {
      decliner: {
        id: Meteor.userId(),
        username: Meteor.user().username
      }
    }, socket)
  }

  find_player_sockets() {
    return _.filter(Streamy.sockets(), this.is_participating_player.bind(this))
  }

  find_player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player.id
    })
  }

  is_participating_player(socket) {
    return this.player_ids.indexOf(socket._meteorSession.userId) != -1
  }
}
