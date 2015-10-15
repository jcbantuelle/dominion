ProposalAccepter = class ProposalAccepter {

  constructor(proposal_id) {
    this.proposal_id = proposal_id
  }

  accept_proposal() {
    this.player_accept()
    this.start_game()
  }

  player_accept() {
    Proposals.update({_id: this.proposal_id, 'players._id': Meteor.userId()},
      {
        $set: {'players.$.accepted': true}
      }
    )
  }

  start_game() {
    this.proposal = Proposals.findOne(this.proposal_id)
    if (this.all_players_have_accepted()) {
      this.update_players()
      game_creater = new GameCreater(this.proposal.players, this.proposal.cards)
      game_creater.create()
      Proposals.remove(this.proposal._id)
    }
  }

  update_players() {
    _.each(this.proposal.players, function(player) {
      Meteor.users.update(player._id, {
        $unset: {has_proposal: ''}
      })
    })
  }

  all_players_have_accepted() {
    return this.pending_accept_players().length == 0
  }

  pending_accept_players() {
    return _.filter(this.proposal.players, function(player) {
      return !player.accepted
    })
  }

}
