Raid = class Raid extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    let silvers = _.filter(player_cards.in_play, function(card) {
      return card.name === 'Silver'
    })
    _.times(_.size(silvers), function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    })

    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game, player_cards)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      if (!other_player_cards.tokens.minus_card) {
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> takes their -1 card token`)
        other_player_cards.tokens.minus_card = true
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${other_player_cards.username}</strong> already has their -1 card token`)
      }
    })
  }

}
