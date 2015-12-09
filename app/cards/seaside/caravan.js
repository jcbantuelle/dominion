Caravan = class Caravan extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())

    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1, false)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> draws 1 card from ${CardView.render(duration_card)}`)
  }

}
