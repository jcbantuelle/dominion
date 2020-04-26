OvergrownEstate = class OvergrownEstate extends Card {

  types() {
    return ['victory', 'shelter']
  }

  coin_cost() {
    return 1
  }

  victory_points() {
    return 0
  }

  trash_event(trasher) {
    let card_drawer = new CardDrawer(trasher.game, trasher.player_cards)
    card_drawer.draw(1)
  }

}
