Key = class Key extends Artifact {

  start_turn_event(game, player_cards, key) {
    let coin_gainer = new CoinGainer(game, player_cards, key)
    coin_gainer.gain(1)
  }
}
