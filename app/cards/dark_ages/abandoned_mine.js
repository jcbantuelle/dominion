AbandonedMine = class AbandonedMine extends Ruins {

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
  }

}
