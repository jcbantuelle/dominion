CostCalculator = class CostCalculator {

  static calculate(game, card, buy_phase = false, player_cards = undefined) {
    let cost = _.isPlainObject(card) ? card.coin_cost : card.coin_cost()
    let type = _.isPlainObject(card) ? card.types : card.type_class()
    let name = _.isPlainObject(card) ? card.name : card.name()
    let stack_name = _.isPlainObject(card) ? card.stack_name : card.stack_name()

    if (!player_cards) {
      player_cards = PlayerCardsModel.find(game._id)
    }

    let current_player_cards = _.find(player_cards, function(cards) {
      return cards.player_id === game.turn.player._id
    })
    if (!current_player_cards) {
      return 0
    }

    let in_play_cards = _.flatten(_.map(player_cards, 'in_play'))

    let discount_token = _.find(current_player_cards.tokens.pile, function(token) {
      return token.effect === 'discount'
    })

    if (discount_token && discount_token.card.name === stack_name) {
      cost -= 2
    }

    let canal = _.find(current_player_cards.projects, (project) => {
      return project.name === 'Canal'
    })
    if (canal) {
      cost -= 1
    }

    let highways = _.size(_.filter(in_play_cards, function(player_card) {
      return player_card.name === 'Highway'
    }))
    cost -= highways

    let bridge_trolls = _.size(_.filter(current_player_cards.in_play, function(player_card) {
      return player_card.name === 'Bridge Troll'
    }))
    cost -= bridge_trolls

    let princesses = _.size(_.filter(in_play_cards, function(player_card) {
      return player_card.name === 'Princess'
    }))
    cost -= (princesses * 2)

    if (_.includes(_.words(type), 'action')) {
      let quarries = _.size(_.filter(in_play_cards, function(player_card) {
        return player_card.name === 'Quarry'
      }))
      cost -= (quarries * 2)
    }

    if (name === 'Peddler' && (game.turn.phase === 'buy' || game.turn.phase === 'treasure' || buy_phase)) {
      let action_count = _.size(_.filter(in_play_cards, function(player_card) {
        return _.includes(_.words(player_card.types), 'action')
      }))
      cost -= (action_count * 2)
    }

    cost -= game.turn.coin_discount
    if (cost < 0) cost = 0
    return cost
  }

}
