Misery = class Misery extends Hex {

  receive(game, player_cards) {
    let miserable_card = _.find(player_cards.states, function(state) {
      return _.includes(['Miserable', 'Twice Miserable'], state.name)
    })
    if (!miserable_card) {
      let miserable = _.find(game.states, function(state) {
        return state.name === 'Miserable'
      })
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(game.states, player_cards.states, miserable)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> takes ${CardView.render(miserable)}`)
    } else if (miserable_card.name === 'Miserable') {
      let twice_miserable = _.find(game.states, function(state) {
        return state.name === 'Twice Miserable'
      })
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.states, game.states, miserable_card)
      card_mover.move(game.states, player_cards.states, twice_miserable)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(miserable_card)} and takes ${CardView.render(twice_miserable)}`)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> already has ${CardView.render(miserable_card)}`)
    }
  }
}
