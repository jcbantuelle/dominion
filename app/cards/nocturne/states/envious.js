Envious = class Envious extends State {

  start_buy_event(game, player_cards, envious) {
    game.turn.envious = true

    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.states, game.states, envious)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(envious)}`)
  }

}
