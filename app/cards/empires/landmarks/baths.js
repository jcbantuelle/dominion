Baths = class Baths extends Landmark {

  end_turn_event(game, player_cards, baths) {
    let baths_stack = _.find(game.landmarks, (card) => {
      return card.name === 'Baths'
    })

    let victory_tokens = Math.min(2, baths_stack.victory_tokens)
    baths_stack.victory_tokens -= victory_tokens

    let victory_token_gainer = new VictoryTokenGainer(game, player_cards, baths)
    victory_token_gainer.gain(victory_tokens)
  }

}
