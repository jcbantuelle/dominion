LobbyController = LoggedInController.extend({

  onBeforeAction: function () {
    let player = Meteor.users.findOne(Meteor.userId())
    if (player.current_game) {
      this.redirect(`/game/${player.current_game}`)
    } else {
      this.next()
    }
  },

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('proposal')
    ]
  },

  data: function () {
    return {
      lobby_players: Meteor.users.find({
        _id: {$ne: Meteor.userId()},
        'status.online': true,
        current_game: {$exists: false}
      }),
      proposal: Proposals.findOne({}, {
        transform: function(proposal) {
          proposal.is_proposer = proposal.proposer.id == Meteor.userId()
          _.each(proposal.players, function(player) {
            if (player._id == Meteor.userId() && player.accepted) {
              proposal.accepted = true
            }
          })
          return proposal
        }
      }),
      player: Meteor.user()
    }
  }

})
