AccountsController = LoggedInAdminController.extend({

  waitOn: function () {
    return [
      Meteor.subscribe('players')
    ]
  },

  data: function () {
    return {
      unapproved_players: Meteor.users.find({
        approved: {$exists: false},
        disabled: {$exists: false}
      }),
      approved_players: Meteor.users.find({
        approved: true,
        disabled: {$exists: false}
      }),
      disabled_players: Meteor.users.find({
        disabled: true
      })
    }
  }

})
