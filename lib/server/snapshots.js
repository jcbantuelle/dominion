GamesSnapshot = new Mongo.Collection('games_snapshot')
PlayerCardsSnapshot = new Mongo.Collection('player_cards_snapshot')

Meteor.startup(function () {
  let games_snapshot = GamesSnapshot.findOne()
  if (games_snapshot) {
    Games.set(GamesSnapshot.findOne().games)
  }

  let player_cards_snapshot = PlayerCardsSnapshot.findOne()
  if (player_cards_snapshot) {
    _.each(PlayerCardsSnapshot.findOne().games, function(player_cards, game_id) {
      PlayerCards[game_id] = new ReactiveDict()
      PlayerCards[game_id].set(player_cards)
    })
  }
  GamesSnapshot.remove({})
  PlayerCardsSnapshot.remove({})
})
