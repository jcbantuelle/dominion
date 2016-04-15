ProposalAccepter = class ProposalAccepter {

  constructor(proposal_id) {
    this.proposal_id = proposal_id
  }

  accept_proposal() {
    this.player_accept()
    this.start_game()
  }

  player_accept() {
    ProposalModel.update({_id: this.proposal_id, 'players._id': Meteor.userId()},
      {
        $set: {'players.$.accepted': true}
      }
    )
  }

  start_game() {
    this.proposal = ProposalModel.findOne(this.proposal_id)
    if (this.all_players_have_accepted()) {
      this.update_players()
      game_creator = new GameCreator(this.proposal.players, this.proposal.cards, this.proposal.exclusions)
      game_creator.create()
      ProposalModel.remove(this.proposal._id)
    }
  }

  update_players() {
    _.each(this.proposal.players, function(player) {
      Meteor.users.update(player._id, {
        $unset: {
          has_proposal: '',
          declined_proposal: ''
        }
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
