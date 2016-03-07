PlayersShowController = LoggedInController.extend({

  waitOn: function() {
    return [
      Meteor.subscribe('player_rankings'),
      Meteor.subscribe('game_history'),
      Meteor.subscribe('players')
    ]
  },

  data: function () {
    let player = PlayerRankings.findOne({username: this.params.id}, {
      transform: function(player) {
        let total_games = player.wins + player.losses
        player.win_ratio = total_games === 0 ? 0 : ((player.wins / total_games) * 100).toFixed(2)

        player.opponents = _.map(player.opponents, function(opponent) {
          let opponent_games = opponent.wins + opponent.losses
          opponent.win_ratio = total_games === 0 ? 0 : ((opponent.wins / opponent_games) * 100).toFixed(2)
          return opponent
        })
        return player
      }
    })
    if (player) {
      player.games = GameHistory.find({'players.username': player.username}, {
        sort: {created_at: -1},
        limit: 15,
        transform: function(game) {
          game.created_at = dateFormat(game.created_at, "yyyy-mm-dd hh:MM:ss TT")
          return game
        }
      }).fetch()
    }

    return player
  }

})
