WayOfTheSheep = class WayOfTheSheep extends Way {

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)
  }

}