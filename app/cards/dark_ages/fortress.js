Fortress = class Fortress extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)
  }

  trash_event(trasher, fortress) {
    let card_mover = new CardMover(trasher.game, trasher.player_cards)
    if (card_mover.move(trasher.game.trash, trasher.player_cards.hand, fortress)) {
      trasher.game.log.push(`&nbsp;&nbsp;<strong>${trasher.player_cards.username}</strong> puts ${CardView.render(fortress)} in their hand`)
    }
  }

}
