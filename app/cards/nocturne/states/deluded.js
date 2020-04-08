Deluded = class Deluded extends State {

  start_buy_event(game, player_cards) {
    game.turn.deluded = true

    let deluded_index = _.findIndex(player_cards.states, function(state) {
      return state.name === 'Deluded'
    })
    deluded = player_cards.states.splice(deluded_index, 1)[0]
    game.states.push(deluded)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(this)}`)
  }

}
