WayOfTheFrog = class WayOfTheFrog extends Way {

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let discard_effect = this.to_h()
    discard_effect.target = card_player.card
    game.turn.discard_effects.push(discard_effect)
  }

  discard_event(discarder, way_of_the_frog) {
    let card_mover = new CardMover(discarder.game, discarder.player_cards)
    if (card_mover.move(discarder.player_cards.in_play, discarder.player_cards.deck, way_of_the_frog.target)) {
      discarder.game.log.push(`<strong>${discarder.player_cards.username}</strong> puts ${CardView.render(way_of_the_frog.target)} on top of their deck`)
    }
  }

}
