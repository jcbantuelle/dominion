TheFieldsGift = class TheFieldsGift extends Boon {

  receive(game, player_cards) {
    game.turn.actions += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$${gained_coins}`)
    return true
  }

}
