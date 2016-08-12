Baths = class Baths extends Landmark {

  end_turn_event(game, player_cards) {
    if (_.size(game.turn.gained_cards) === 0) {
      let baths_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Baths'
      })

      let victory_tokens = Math.min(2, baths_stack.victory_tokens)
      baths_stack.victory_tokens = Math.max(0, baths_stack.victory_tokens - 2)

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
