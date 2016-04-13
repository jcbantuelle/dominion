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
      return _.includes(_.words(card.types), 'treasure')
    })

    let coins = 4 - _.size(treasures)
    coins = coins < 0 ? 0 : coins

    let gained_coins = CoinGainer.gain(game, player_cards, coins)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
