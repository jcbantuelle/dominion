Misery = class Misery extends Hex {

  receive(game, player_cards) {
    let miserable_index = _.findIndex(player_cards.states, function(state) {
      return _.includes(['Miserable', 'Twice Miserable'], state.name)
    })
    if (miserable_index === -1) {
      let miserable = (new Miserable()).to_h()
      player_cards.states.push(miserable)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(miserable, true)}`)
    } else if (player_cards.states[miserable_index].name === 'Miserable') {
      let miserable = player_cards.states.splice(miserable_index, 1)[0]
      let twice_miserable = (new TwiceMiserable()).to_h()
      player_cards.states.push(twice_miserable)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> flips ${CardView.render(miserable, true)} over to ${CardView.render(twice_miserable, true)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(player_cards.states[miserable_index], true)}`)
    }
  }
}
