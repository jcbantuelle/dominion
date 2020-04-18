Madman = class Madman extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let card_mover = new CardMover(game, player_cards)
    let return_count = card_mover.return_to_supply(player_cards.in_play, 'Madman', [card_player.card])

    if (return_count === 1) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(card_player.card)} to the ${CardView.render(card_player.card)} pile`)

      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(_.size(player_cards.hand))
    }
  }

}
