Meteor.startup(function () {
  let players = Meteor.users.find().fetch()
  let players_with_rankings = _.map(PlayerRankings.find().fetch(), function(ranking) {
    return ranking.username
  })

  let players_without_rankings = _.filter(players, function(player) {
    return !_.contains(players_with_rankings, player.username)
  })

  _.each(players_without_rankings, function(player) {
    PlayerRankings.insert({
      username: player.username,
      wins: 0,
      losses: 0,
      opponents: []
    })
  })
})
