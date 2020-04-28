import { FlowRouter } from 'meteor/ostrio:flow-router-extra'

Template.playersListing.helpers({
  players_listing() {
    return {
      players: PlayerRankings.find({$or: [ {wins: {$gt: 0}}, {losses: {$gt: 0}}]}, {
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

Template.playersListing.events({
  'click a': function(event) {
    event.preventDefault()
    FlowRouter.go(event.target.getAttribute('href'))
  }
})