CostCalculator = class CostCalculator {

  static calculate(game, player_cards, card) {
    let cost = _.isPlainObject(card) ? card.coin_cost : card.coin_cost()

    if (player_cards) {
      let highways = _.size(_.filter(player_cards.in_play, function(card) {
        return card.name === 'Highway'
      }))
      cost = highways > cost ? 0 : cost - highways
    }
    return cost
  }

}
