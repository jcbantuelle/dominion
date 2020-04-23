Expedition = class Expedition extends Event {

  coin_cost() {
    return 3
  }

  buy(game, player_cards) {
    player_cards.end_turn_event_effects.push(this.to_h())
  }

  end_turn_event(game, player_cards, expedition) {
    let card_drawer = new CardDrawer(game, player_cards, expedition)
    card_drawer.draw(2)
  }
}
