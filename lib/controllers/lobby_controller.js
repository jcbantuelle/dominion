LobbyController = LoggedInController.extend({

  onBeforeAction: function () {
    console.log(Meteor.user())
    if (Meteor.user().current_game) {
      this.redirect(`game/${Meteor.user().current_game}`)
    } else {
      this.next()
    }
  },

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('proposal'),
      Meteor.subscribe('game')
    ]
  },
  }

})
