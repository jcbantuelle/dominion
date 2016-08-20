Labyrinth = class Labyrinth extends Landmark {

  gain_event(gainer) {
    let game = gainer.game
    let player_cards = gainer.player_cards

    if (_.size(game.turn.gained_cards) === 2) {

      let labyrinth_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Labyrinth'
      })

      let victory_tokens = Math.min(2, labyrinth_stack.victory_tokens)
      labyrinth_stack.victory_tokens = Math.max(0, labyrinth_stack.victory_tokens - 2)

      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.victory_tokens += victory_tokens
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(this)}`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.victory_tokens += victory_tokens
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(this)}`)
      }
    }
  }

}
