GameCreater = class GameCreater {

  constructor(players, cards) {
    this.players = players
    this.cards = cards
  }

  create() {
    game_id = this.create_game()
    this.assign_game_to_players()
  }

  create_game() {
    return Games.insert({
      players: this.players,
      cards: this.cards
    })
  }

  assign_game_to_players() {
    _.each(this.players, function(player) {
      Meteor.users.update(player._id, {
        $set: {current_game: game_id}
      })
    })
  }

}
