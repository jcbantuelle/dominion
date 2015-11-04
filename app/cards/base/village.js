Village = class Village extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +2 actions`)
  }

}
