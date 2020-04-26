Colonnade = class Colonnade extends Landmark {

  buy_event(buyer, colonnade) {
    let colonnade_stack = _.find(buyer.game.landmarks, (card) => {
      return card.name === 'Colonnade'
    })

    let victory_tokens = Math.min(2, colonnade_stack.victory_tokens)
    colonnade_stack.victory_tokens -= victory_tokens

    let victory_token_gainer = new VictoryTokenGainer(buyer.game, buyer.player_cards, colonnade)
    victory_token_gainer.gain(victory_tokens)
  }

}
