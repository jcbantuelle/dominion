AbandonedMine = class AbandonedMine extends Ruins {

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

}
