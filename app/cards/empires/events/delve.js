Delve = class Delve extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain_game_card()
  }

}
