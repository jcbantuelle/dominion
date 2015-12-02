PoorHouse = class PoorHouse extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 1
  }

  play(game, player_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(player_cards.hand)}`)

    let treasures = _.filter(player_cards.hand, function(card) {
      return _.contains(card.types, 'treasure')
    })

    let coins = 4 - _.size(treasures)
    coins = coins < 0 ? 0 : coins

    game.turn.coins += coins
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${coins}`)
  }

}
