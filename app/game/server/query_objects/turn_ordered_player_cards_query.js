TurnOrderedPlayerCardsQuery = class TurnOrderedPlayerCardsQuery {

  static turn_ordered_player_cards(game, first_player_cards) {
    let ordered_players = TurnOrderedPlayersQuery.turn_ordered_players(game)

    let unordered_player_cards = PlayerCardsModel.find(game._id)

    let ordered_player_cards = _.sortBy(unordered_player_cards, function(cards) {
      return _.findIndex(ordered_players, function(player) {
        return player._id === cards.player_id
      })
    })

    if (first_player_cards) {
      let first_player_index = _.findIndex(ordered_player_cards, function(player_cards) {
        return player_cards._id === first_player_cards._id
      })

      ordered_player_cards = _.slice(ordered_player_cards, first_player_index).concat(_.slice(ordered_player_cards, 0, first_player_index))
      ordered_player_cards[0] = first_player_cards
    }
    return ordered_player_cards
  }

}
