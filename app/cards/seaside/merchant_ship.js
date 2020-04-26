MerchantShip = class MerchantShip extends Duration {

  types() {
    return this.capitalism_types(['action', 'duration'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, merchant_ship) {
    let coin_gainer = new CoinGainer(game, player_cards, merchant_ship)
    coin_gainer.gain(2)
  }

}
