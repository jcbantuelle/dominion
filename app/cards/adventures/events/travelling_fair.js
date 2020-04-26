TravellingFair = class TravellingFair extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(2)

    game.turn.travelling_fair = true
  }

  gain_event(gainer) {
    let card_mover = new CardMover(gainer.game, gainer.player_cards)
    if (card_mover.move(gainer.player_cards[gainer.destination], gainer.player_cards.deck, gainer.gained_card)) {
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> puts ${CardView.render(gainer.gained_card)} on top of their deck`)
      gainer.destination = 'deck'
    }
  }

}
