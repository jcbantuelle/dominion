Tower = class Tower extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game)
  }

  point_variable(player_cards, game) {
    let grouped_cards = _.groupBy(player_cards, function(card) {
      return card.stack_name
    })
    let point_cards = _.filter(grouped_cards, function(card_group) {
      let game_stack = _.find(game.cards, function(card) {
        return card.stack_name === card_group[0].stack_name
      })
      return game_stack && !_.includes(_.words(card_group[0].types), 'victory') && game_stack.count === 0
    })
    return _.reduce(point_cards, function(total, cards) {
      return total + _.size(cards)
    }, 0)
  }

}
