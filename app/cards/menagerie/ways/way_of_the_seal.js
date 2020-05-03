WayOfTheSeal = class WayOfTheSeal extends Way {

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(1)

    game.turn.way_of_the_seal = true
  }

  gain_event(gainer) {
    let card_mover = new CardMover(gainer.game, gainer.player_cards)
    if (card_mover.move(gainer.player_cards[gainer.destination], gainer.player_cards.deck, gainer.gained_card)) {
      gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> puts ${CardView.render(gainer.gained_card)} on top of their deck`)
      gainer.destination = 'deck'
    }
  }

}