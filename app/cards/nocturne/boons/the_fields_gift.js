TheFieldsGift = class TheFieldsGift extends Boon {

  receive(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)

    return true
  }

}
