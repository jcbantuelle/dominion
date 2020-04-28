Meteor.methods({
  destroyGame: function(game_id) {
    if (Meteor.user().admin) {
      Meteor.users.update({current_game: game_id}, {$unset: {current_game: ''}}, {multi: true})
      GameModel.remove(game_id)
      Streamy.broadcast('game_destroyed', {game_id: game_id})
    }
  }
})

