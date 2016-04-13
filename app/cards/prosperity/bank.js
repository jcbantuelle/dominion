Bank = class Bank extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 7
  }

  play(game, player_cards) {
    let treasure_count = _.size(_.filter(player_cards.in_play.concat(player_cards.playing), function(card) {
      return _.includes(_.words(card.types), 'treasure')
    }))
    let gained_coins = CoinGainer.gain(game, player_cards, treasure_count)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
