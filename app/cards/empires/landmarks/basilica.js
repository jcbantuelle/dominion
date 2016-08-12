Basilica = class Basilica extends Landmark {

  buy_event(buyer) {
    let game = buyer.game
    let player_cards = buyer.player_cards
    let basilica_stack = _.find(game.landmarks, (card) => {
      return card.name === 'Basilica'
    })

    let victory_tokens = Math.min(2, basilica_stack.victory_tokens)
    basilica_stack.victory_tokens = Math.max(0, basilica_stack.victory_tokens - 2)

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
