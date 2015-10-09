GameProposer = class GameProposer {

  constructor(player_ids) {
    this.players = this.find_players(player_ids)
  }

  propose() {
    Proposals.insert({
      proposer: {
        id: Meteor.userId(),
        username: Meteor.user().username
      },
      players: this.players
    })
  }

  find_players(player_ids) {
    player_ids.push(Meteor.userId())
    let players = Meteor.users.find({_id: {$in: player_ids}})
    return players.map(function(player) {
      return {
        id: player._id,
        username: player.username
      }
    })
  }
}
