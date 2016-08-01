Aqueduct = class Aqueduct extends Landmark {

  gain_event(gainer) {
    if (_.includes(_.words(gainer.gained_card.types), 'treasure')) {
      let gained_card_stack = _.find(gainer.game.cards, (card) => {
        return card.stack_name === gainer.gained_card.stack_name
      })
      if (gained_card_stack && gained_card_stack.victory_tokens > 0) {
        let aqueduct_stack = _.find(gainer.game.landmarks, (card) => {
          return card.name === 'Aqueduct'
        })
        if (aqueduct_stack) {
          aqueduct_stack.victory_tokens += 1
          gained_card_stack.victory_tokens -= 1
          gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> moves +1 &nabla; from ${CardView.render(gainer.gained_card)} to ${CardView.render(this)}`)
        }
      }
    }

    if (_.includes(_.words(gainer.gained_card.types), 'victory')) {
      let aqueduct_stack = _.find(gainer.game.landmarks, (card) => {
        return card.name === 'Aqueduct'
      })
      if (aqueduct_stack && aqueduct_stack.victory_tokens > 0) {
        let victory_tokens = aqueduct_stack.victory_tokens
        aqueduct_stack.victory_tokens = 0

        gainer.player_cards.victory_tokens += victory_tokens
        gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> gets +${victory_tokens} &nabla; from ${CardView.render(this)}`)
      }
    }
  }

}
