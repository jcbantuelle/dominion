Moat = class Moat extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)
  }

  attack_event(game, player_cards) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(this)}`)
    player_cards.moat = true
  }

}
