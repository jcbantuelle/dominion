Keep = class Keep extends Landmark {

  victory_points(player_cards, game) {
    return this.point_variable(player_cards, game) * 5
  }

  point_variable(player_cards, game) {
    let current_player_treasures = this.grouped_player_treasures(player_cards)
    let all_player_treasures = this.all_player_treasures(game)
    return _.size(this.more_copy_treasures(current_player_treasures, all_player_treasures))
  }

  all_player_treasures(game) {
    return _.map(PlayerCardsModel.find(game._id), (player_cards) => {
      let cards = AllPlayerCardsQuery.find(player_cards)
      return this.grouped_player_treasures(cards)
    })
  }

  grouped_player_treasures(player_cards) {
    return _.chain(player_cards).filter(function(card) {
      return _.includes(_.words(card.types), 'treasure')
    }).groupBy(function(card) {
      return card.name
    }).map(function(cards, card_name) {
      return {
        name: card_name,
        count: _.size(cards)
      }
    }).value()
  }

  more_copy_treasures(current_player_treasures, all_player_treasures) {
    return _.filter(current_player_treasures, function(treasure) {
      return !_.some(all_player_treasures, function(player_treasures) {
        return _.find(player_treasures, function(other_treasure) {
          return other_treasure.name === treasure.name && other_treasure.count > treasure.count
        })
      })
    })
  }

}
