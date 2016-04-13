CostCalculator = class CostCalculator {

  static calculate(game, card, player_cards = undefined, buy_phase = false) {
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
    let current_player_in_play_cards = current_player_cards.in_play.concat(current_player_cards.duration).concat(current_player_cards.permanent)

    let in_play_cards = _.flatten(_.map(player_cards, 'in_play').concat(_.map(player_cards, 'duration')).concat(_.map(player_cards, 'permanent')))

    let discount_token = _.find(current_player_cards.tokens.pile, function(token) {
      return token.effect === 'discount'
    })

    if (discount_token && discount_token.card.name === stack_name) {
      cost -= 2
    }

    let highways = _.size(_.filter(in_play_cards, function(player_card) {
      return player_card.inherited_name === 'Highway'
    }))
    cost -= highways

    let bridge_trolls = _.size(_.filter(current_player_in_play_cards, function(player_card) {
      return player_card.inherited_name === 'Bridge Troll'
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

    if (name === 'Peddler' && (game.turn.phase === 'buy' || buy_phase)) {
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
