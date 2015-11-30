TurnOrderedPlayerCardsQuery = class TurnOrderedPlayerCardsQuery {

  static turn_ordered_player_cards(game, player_cards) {
    let ordered_players = TurnOrderedPlayersQuery.turn_ordered_players(game)

    let unordered_player_cards = PlayerCardsModel.find({
      game_id: game._id
    }).fetch()

    let ordered_player_cards = _.sortBy(unordered_player_cards, function(cards) {
      return _.findIndex(ordered_players, function(player) {
        return player._id === cards.player_id
      })
    })

    if (player_cards) {
      ordered_player_cards.splice(0, 1, player_cards)
    }
    return ordered_player_cards
  }

}
