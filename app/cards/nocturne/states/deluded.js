Deluded = class Deluded extends State {

  start_buy_event(game, player_cards, deluded) {
    game.turn.deluded = true

    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.states, game.states, deluded)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(deluded)}`)
  }

}
