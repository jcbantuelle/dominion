GreatHall = class GreatHall extends Card {

  types() {
    return ['victory', 'action']
  }

  coin_cost() {
    return 3
  }

  victory_points() {
    return 1
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
  }

}
