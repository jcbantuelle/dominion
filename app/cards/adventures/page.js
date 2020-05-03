Page = class Page extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)
  }

  discard_event(discarder, page) {
    this.choose_exchange(discarder.game, discarder.player_cards, page, 'Treasure Hunter')
  }

}
