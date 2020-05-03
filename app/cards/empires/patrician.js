Patrician = class Patrician extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  stack_name() {
    return 'Patrician/Emporium'
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      if (CardCostComparer.coin_greater_than(game, player_cards.revealed[0], 4)) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in hand`)
        let card_mover = new CardMover(game, player_cards)
        card_mover.move_all(player_cards.revealed, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} back on deck`)
        let card_mover = new CardMover(game, player_cards)
        card_mover.move_all(player_cards.revealed, player_cards.deck)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

}
