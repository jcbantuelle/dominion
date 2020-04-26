Barracks = class Barracks extends Project {

  coin_cost() {
    return 6
  }

  start_turn_event(game, player_cards, barracks) {
    let action_gainer = new ActionGainer(game, player_cards, barracks)
    action_gainer.gain(1)
  }

}
