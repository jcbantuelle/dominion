WayOfTheMole = class WayOfTheMole extends Way {

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_discarder = new CardDiscarder(game, player_cards, 'hand')
    card_discarder.discard()

    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(3)
  }

}
