Stockpile = class Stockpile extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(3, false)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards.in_play, player_cards.exile, card_player.card)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> exiles ${CardView.render(card_player.card)}`)
    }
  }

}
