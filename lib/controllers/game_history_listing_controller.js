GameHistoryListingController = LoggedInController.extend({

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('game_history')
    ]
  },

  data: function () {
    return {
      games: GameHistory.find({}, {
        transform: function(game) {
          game.created_at = dateFormat(game.created_at, "yyyy-mm-dd h:MM:ss TT")
          return game
        }
      })
    }
  }

})
