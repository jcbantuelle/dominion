DefiledShrine = class DefiledShrine extends Landmark {

  gain_event(gainer, defiled_shrine) {
    if (_.includes(_.words(gainer.gained_card.types), 'action')) {
      let gained_card_stack = _.find(gainer.game.cards, (card) => {
        return card.stack_name === gainer.gained_card.stack_name
      })
      if (gained_card_stack && gained_card_stack.victory_tokens > 0) {
        let defiled_shrine_stack = _.find(gainer.game.landmarks, (card) => {
          return card.name === 'Defiled Shrine'
        })
        if (defiled_shrine_stack) {
          defiled_shrine_stack.victory_tokens += 1
          gained_card_stack.victory_tokens -= 1
          gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> moves +1 &nabla; from ${CardView.render(gainer.gained_card)} to ${CardView.render(defiled_shrine)}`)
        }
      }
    }
  }

  buy_event(buyer, defiled_shrine) {
    if (buyer.card.name === 'Curse') {
      let defiled_shrine_stack = _.find(buyer.game.landmarks, (card) => {
        return card.name === 'Defiled Shrine'
      })
      if (defiled_shrine_stack && defiled_shrine_stack.victory_tokens > 0) {
        let victory_token_gainer = new VictoryTokenGainer(buyer.game, buyer.player_cards, defiled_shrine)
        victory_token_gainer.gain(defiled_shrine_stack.victory_tokens)
        defiled_shrine_stack.victory_tokens = 0
      }
    }
  }

}
