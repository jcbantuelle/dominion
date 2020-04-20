Champion = class Champion extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    player_cards.champions += 1

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    return 'duration'
  }

  stay_in_play(game, player_cards, champion) {
    return true
  }

}
