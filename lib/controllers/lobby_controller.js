LobbyController = LoggedInController.extend({

  onBeforeAction: function () {
    let player = Meteor.users.findOne(Meteor.userId())
    if (player.current_game) {
      this.redirect(`/game/${player.current_game}`)
    } else {
      this.next()
    }
  },

  onRun: function () {
    Meteor.call('setLobbyStatus')
    this.next()
  },

  onStop: function () {
    Meteor.call('unsetLobbyStatus')
  },

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('proposal')
    ]
  },

  data: function () {
    return {
      card_sets: _.map(CardList.sets(), function(set) {
        return {
          id: set,
          name: _.startCase(set)
        }
      }),
      lobby_players: Meteor.users.find({
        _id: {$ne: Meteor.userId()},
        'status.online': true,
        lobby: true,
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
