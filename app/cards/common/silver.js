Silver = class Silver extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 2)

    if (game.turn.played_merchant && !game.turn.gained_merchant_silver) {
      game.turn.gained_merchant_silver = true
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins} from ${CardView.card_html('action', 'Merchant')}`)
    }
  }

}
