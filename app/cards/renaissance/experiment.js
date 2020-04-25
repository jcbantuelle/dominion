Experiment = class Experiment extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    let card_mover = new CardMover(game, player_cards)
    let return_count = card_mover.return_to_supply(player_cards.in_play, 'Experiment', [card_player.card])
    if (return_count === 1) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(card_player.card)} to the ${CardView.render(card_player.card)} pile`)
    }
  }

  gain_event(gainer, experiment) {
    let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Experiment', false, experiment)
    card_gainer.gain()
  }

}
