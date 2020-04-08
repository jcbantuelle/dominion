Delusion = class Delusion extends Hex {

  receive(game, player_cards) {
    let existing_state = _.find(player_cards.states, function(state) {
      return _.includes(['Deluded', 'Envious'], state.name)
    })
    if (existing_state) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(existing_state)}`)
    } else {
      let deluded_index = _.findIndex(game.states, function(state) {
        return state.name === 'Deluded'
      })
      let deluded = game.states.splice(deluded_index, 1)[0]
      player_cards.states.push(deluded)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(deluded)}`)
    }
  }
}
