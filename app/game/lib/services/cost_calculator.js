CostCalculator = class CostCalculator {

  static calculate(game, player_cards, card, buy_phase = false) {
    let cost = _.isPlainObject(card) ? card.coin_cost : card.coin_cost()
    let type = _.isPlainObject(card) ? card.types : card.type_class()
    let name = _.isPlainObject(card) ? card.name : card.name()

    if (player_cards) {
      let highways = _.size(_.filter(player_cards.in_play, function(player_card) {
        return player_card.name === 'Highway'
      }))
      cost -= highways

      if (_.contains(type, 'action')) {
        let quarries = _.size(_.filter(player_cards.in_play, function(player_card) {
          return player_card.name === 'Quarry'
        }))
        cost -= (quarries * 2)
      }
    }

    if (name === 'Peddler' && buy_phase) {
      let action_count = _.size(_.filter(player_cards.in_play.concat(player_cards.duration), function(player_card) {
        return _.contains(player_card.types, 'action')
      }))
      cost -= (action_count * 2)
    }

    if (cost < 0) cost = 0
    return cost
  }

}
