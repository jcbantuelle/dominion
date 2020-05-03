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

  play(game, player_cards, card_player) {
    let coins = Math.floor(_.size(player_cards.deck.concat(player_cards.discard)) / 5)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(coins)
  }

}
