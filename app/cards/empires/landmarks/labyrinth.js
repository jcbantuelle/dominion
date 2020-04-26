Labyrinth = class Labyrinth extends Landmark {

  gain_event(gainer, labyrinth) {
    let labyrinth_stack = _.find(gainer.game.landmarks, (card) => {
      return card.name === 'Labyrinth'
    })

    let victory_tokens = Math.min(2, labyrinth_stack.victory_tokens)
    labyrinth_stack.victory_tokens -= victory_tokens

    let victory_token_gainer = new VictoryTokenGainer(gainer.game, gainer.player_cards, labyrinth)
    victory_token_gainer.gain(victory_tokens)
  }

}
