WillOWisp = class WillOWisp extends Card {

  types() {
    return ['action', 'spirit']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) + _.size(player_cards.discard) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      let card_mover = new CardMover(game, player_cards)
      if (CardCostComparer.coin_less_than(game, player_cards.revealed[0], 3)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in thier hand`)
        card_mover.move_all(player_cards.revealed, player_cards.hand)
      } else {
        card_mover.move_all(player_cards.revealed, player_cards.deck)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards to reveal`)
    }
  }

}
