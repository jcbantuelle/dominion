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
    this.update_players()
  }

  update_players() {
    _.each(this.player_ids, (player_id) => {
      Meteor.users.update(player_id, {
        $unset: {has_proposal: ''},
        $set: {declined_proposal: this.decline_message()}
      })
    })
  }

  decline_message() {
    let decliners = _.map(this.declined_players, function(decliner) {
      return decliner._id == Meteor.userId() ? 'You' : decliner.username
    }).join(' and ')
    return `<strong>${decliners}</strong> declined the game.`
  }

  find_player_ids() {
    return _.map(this.proposal.players, function(player) {
      return player._id
    })
  }

}
