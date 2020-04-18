Vagrant = class Vagrant extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(1)

      let card_mover = new CardMover(game, player_cards)
      let types = _.words(player_cards.revealed[0].types)
      if (_.includes(types, 'curse') || _.includes(types, 'ruins') || _.includes(types, 'shelter') || _.includes(types, 'victory')) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} in their hand`)
        card_mover.move_all(player_cards.revealed, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed)} back on top of their deck`)
        card_mover.move_all(player_cards.revealed, player_cards.deck)
      }

    }
  }

}
