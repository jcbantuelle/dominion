Peddler = class Peddler extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 8
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.turn.coins += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$1`)
  }

}
