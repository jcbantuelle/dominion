Tactician = class Tactician extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    if (_.size(player_cards.hand) > 0) {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard()

      player_cards.duration_effects.push(card_player.card)
      return 'duration'
    }
  }

  duration(game, player_cards, tactician) {
    let card_drawer = new CardDrawer(game, player_cards, undefined, tactician)
    let drawn_count = card_drawer.draw(5)

    let action_gainer = new ActionGainer(game, player_cards, tactician)
    action_gainer.gain(1)

    let buy_gainer = new BuyGainer(game, player_cards, tactician)
    buy_gainer.gain(1)
  }

}
