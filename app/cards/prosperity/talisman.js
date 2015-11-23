Talisman = class Talisman extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.coins += 1
  }

  buy_event(buyer) {
    let card_gainer = new CardGainer(buyer.game, buyer.player_cards, 'discard', buyer.card.name())
    card_gainer.gain_game_card()
  }

}
