Destrier = class Destrier extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)
  }

}
