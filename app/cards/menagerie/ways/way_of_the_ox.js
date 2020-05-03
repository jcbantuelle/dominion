WayOfTheOx = class WayOfTheOx extends Way {

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

}
