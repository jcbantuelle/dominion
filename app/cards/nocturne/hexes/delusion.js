Delusion = class Delusion extends Hex {

  receive(game, player_cards) {
    let existing_state = _.find(player_cards.states, function(state) {
      return _.includes(['Deluded', 'Envious'], state.name)
    })
    if (existing_state) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(existing_state, true)}`)
    } else {
      let deluded = (new Deluded()).to_h()
      player_cards.states.push(deluded)
    }
  }
}
