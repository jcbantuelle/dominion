PoorHouse = class PoorHouse extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 1
  }

  play(game, player_cards) {
    let card_revealer = new CardRevealer(game, player_cards)
    card_revealer.reveal('hand')

    let treasures = _.filter(player_cards.hand, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    })

    let coins = 4 - _.size(treasures)
    coins = coins < 0 ? 0 : coins

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(coins)
  }

}
