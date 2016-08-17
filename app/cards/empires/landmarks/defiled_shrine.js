DefiledShrine = class DefiledShrine extends Landmark {

  gain_event(gainer) {
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
          gainer.game.log.push(`&nbsp;&nbsp;<strong>${gainer.player_cards.username}</strong> moves +1 &nabla; from ${CardView.render(gainer.gained_card)} to ${CardView.render(this)}`)
        }
      }
    }
  }

  buy_event(buyer) {
    let game = buyer.game
    let player_cards = buyer.player_cards
    if (buyer.card.name() === 'Curse') {
      let defiled_shrine_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Defiled Shrine'
      })
      if (defiled_shrine_stack && defiled_shrine_stack.victory_tokens > 0) {
        let victory_tokens = defiled_shrine_stack.victory_tokens
        defiled_shrine_stack.victory_tokens = 0

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

}
