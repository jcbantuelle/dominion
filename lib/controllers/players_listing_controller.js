PlayersListingController = LoggedInController.extend({

  waitOn: function () {
    return [
      Meteor.subscribe('players'),
      Meteor.subscribe('player_rankings')
    ]
  },

  data: function () {
    return {
      players: PlayerRankings.find({}, {
        sort: {username: 1},
        transform: function(player) {
          let total_games = player.wins + player.losses
          player.win_ratio = total_games === 0 ? 0 : ((player.wins / total_games) * 100).toFixed(2)
          return player
        }
      })
    }
  }

})
