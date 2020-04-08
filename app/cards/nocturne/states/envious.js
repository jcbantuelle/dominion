Envious = class Envious extends State {

  start_buy_event(game, player_cards) {
    game.turn.envious = true

    let envious_index = _.findIndex(player_cards.states, function(state) {
      return state.name === 'Envious'
    })
    envious = player_cards.states.splice(envious_index, 1)[0]
    game.states.push(envious)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(this)}`)
  }

}
