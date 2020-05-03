WayOfTheSquirrel = class WayOfTheSquirrel extends Way {

  play(game, player_cards, card_player) {
    player_cards.end_turn_event_effects.push(this.to_h())
  }

  end_turn_event(game, player_cards, way_of_the_squirrel) {
    let card_drawer = new CardDrawer(game, player_cards, undefined, way_of_the_squirrel)
    card_drawer.draw(2)
  }

}
