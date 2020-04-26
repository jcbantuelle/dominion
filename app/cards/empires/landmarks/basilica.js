Basilica = class Basilica extends Landmark {

  buy_event(buyer, basilica) {
    if (buyer.game.turn.coins >= 2) {
      let basilica_stack = _.find(buyer.game.landmarks, (card) => {
        return card.name === 'Basilica'
      })

      let victory_tokens = Math.min(2, basilica_stack.victory_tokens)
      basilica_stack.victory_tokens -= victory_tokens

      let victory_token_gainer = new VictoryTokenGainer(buyer.game, buyer.player_cards, basilica)
      victory_token_gainer.gain(victory_tokens)
    }

  }

}
