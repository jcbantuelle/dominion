Bank = class Bank extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards) {
    let treasure_count = _.size(_.filter(player_cards.in_play, function(card) {
      return _.includes(_.words(card.types), 'treasure')
    }))
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(treasure_count)
  }

}
