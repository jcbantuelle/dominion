Page = class Page extends Traveller {

  types() {
    return ['action', 'traveller']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)
  }

  discard_event(discarder, card_name = 'Page') {
    this.choose_exchange(discarder.game, discarder.player_cards, card_name, 'Treasure Hunter')
  }

}
