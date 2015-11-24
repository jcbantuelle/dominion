Hoard = class Hoard extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    game.turn.coins += 2
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()
  }

}
