RuinedLibrary = class RuinedLibrary extends Card {

  types() {
    return ['action', 'ruins']
  }

  stack_name() {
    return 'Ruins'
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)
  }

}