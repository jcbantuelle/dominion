CostCalculator = class CostCalculator {

  static calculate(game, player_cards, card) {
    let cost = _.isPlainObject(card) ? card.coin_cost : card.coin_cost()
    let type = _.isPlainObject(card) ? card.types : card.type_class()

    if (player_cards) {
      let highways = _.size(_.filter(player_cards.in_play, function(card) {
        return card.name === 'Highway'
      }))
      cost -= highways

      if (_.contains(type, 'action')) {
        let quarries = _.size(_.filter(player_cards.in_play, function(card) {
          return card.name === 'Quarry'
        }))
        cost -= (quarries * 2)
      }
    }

    if (cost < 0) cost = 0
    return cost
  }

}
