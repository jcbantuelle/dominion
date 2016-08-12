Battlefield = class Battlefield extends Landmark {

  gain_event(gainer) {
    let game = gainer.game
    let player_cards = gainer.player_cards
    let battlefield_stack = _.find(game.landmarks, (card) => {
      return card.name === 'Battlefield'
    })

    let victory_tokens = Math.min(2, battlefield_stack.victory_tokens)
    battlefield_stack.victory_tokens = Math.max(0, battlefield_stack.victory_tokens - 2)

    player_cards.victory_tokens += victory_tokens
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(this)}`)
  }

}
