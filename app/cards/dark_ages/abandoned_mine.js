AbandonedMine = class AbandonedMine extends Ruins {

  types() {
    return this.capitalism_types(super.types())
  }

  capitalism() {
    return true
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(1)
  }

}
