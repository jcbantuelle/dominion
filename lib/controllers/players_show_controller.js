PlayersShowController = LoggedInController.extend({

  waitOn: function() {
    return [
      Meteor.subscribe('player_rankings'),
      Meteor.subscribe('players')
    ]
  },

  data: function () {
    let player = PlayerRankings.findOne({username: this.params.id}, {
      transform: function(player) {
        let total_games = player.wins + player.losses
        player.win_ratio = total_games === 0 ? 0 : (player.wins / total_games) * 100

        player.opponents = _.map(player.opponents, function(opponent) {
          let opponent_games = opponent.wins + opponent.losses
          opponent.win_ratio = total_games === 0 ? 0 : (opponent.wins / opponent_games) * 100
          return opponent
        })
        return player
      }
    })

    return player
  }

})
