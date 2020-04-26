Battlefield = class Battlefield extends Landmark {

  gain_event(gainer, battlefield) {
    let battlefield_stack = _.find(gainer.game.landmarks, (card) => {
      return card.name === 'Battlefield'
    })

    let victory_tokens = Math.min(2, battlefield_stack.victory_tokens)
    battlefield_stack.victory_tokens -= victory_tokens

    let victory_token_gainer = new VictoryTokenGainer(gainer.game, gainer.player_cards)
    victory_token_gainer.gain(victory_tokens)
  }

}
