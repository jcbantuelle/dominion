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
  }

})
