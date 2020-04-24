Delusion = class Delusion extends Hex {

  receive(game, player_cards) {
    let existing_state = _.find(player_cards.states, function(state) {
      return _.includes(['Deluded', 'Envious'], state.name)
    })
    if (existing_state) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(existing_state)}`)
    } else {
      let deluded = _.find(game.states, function(state) {
        return state.name === 'Deluded'
      })
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(game.states, player_cards.states, deluded)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(deluded)}`)
    }
  }
}
