Necropolis = class Necropolis extends Card {

  types() {
    return ['action', 'shelter']
  }

  coin_cost() {
    return 1
  }

  play(game, player_cards) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

}
