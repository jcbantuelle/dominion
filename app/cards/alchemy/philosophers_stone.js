PhilosophersStone = class PhilosophersStone extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  potion_cost() {
    return 1
  }

  play(game, player_cards) {
    let coins = Math.floor(_.size(player_cards.deck.concat(player_cards.discard)) / 5)
    let gained_coins = CoinGainer.gain(game, player_cards, coins)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
