LobbyController = LoggedInController.extend({

  onBeforeAction: function () {
    console.log(Meteor.user())
    if (Meteor.user().current_game) {
      this.redirect(`game/${Meteor.user().current_game}`)
    } else {
      this.next()
    }
  },

  subscriptions: function() {
    return [
      Meteor.subscribe('lobby_players')
      Meteor.subscribe('proposal')
      Meteor.subscribe('game')
    ]
  }

})
