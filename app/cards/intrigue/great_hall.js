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

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)
  }

}
