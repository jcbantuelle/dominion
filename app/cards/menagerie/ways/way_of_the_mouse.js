WayOfTheMouse = class WayOfTheMouse extends Way {

  play(game, player_cards, card_player) {
    let mouse_card_player = new CardPlayer(game, player_cards, game.way_of_the_mouse, card_player.card)
    mouse_card_player.play(true, false)
  }

}
