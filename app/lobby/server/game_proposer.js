GameProposer = class GameProposer {

  constructor(player_ids) {
    this.players = this.find_players(player_ids)
  }

  propose() {
    proposal_id = this.create_proposal()
    this.set_proposal_timeout(proposal_id)
  }

  create_proposal() {
    return Proposals.insert({
      proposer: {
        id: Meteor.userId(),
        username: Meteor.user().username
      },
      players: this.players
    })
  }

  set_proposal_timeout(proposal_id) {
    Meteor.setTimeout(function() {
      if (Proposals.findOne(proposal_id)) {
        let proposal_decliner = new ProposalDecliner(proposal_id)
        proposal_decliner.timeoutDecline()
      }
    }, 30000)
  }

  find_players(player_ids) {
    player_ids.push(Meteor.userId())
    let players = Meteor.users.find({_id: {$in: player_ids}})
    return players.map(function(player) {
      return {
        id: player._id,
        username: player.username
      }
    })
  }
}
