AccountsController = LoggedInAdminController.extend({

  waitOn: function () {
    return [
      Meteor.subscribe('players')
    ]
  },

  data: function () {
    return {
      unapproved_players: Meteor.users.find({
        approved: {$exists: false}
      }),
      approved_players: Meteor.users.find({
        approved: true,
        _id: {$ne: Meteor.userId()},
      })
    }
  }

})
