Colonnade = class Colonnade extends Landmark {

  buy_event(buyer) {
    let game = buyer.game
    let player_cards = buyer.player_cards
    if (_.includes(buyer.card.types(), 'action') && _.some(player_cards.in_play.concat(player_cards.duration).concat(player_cards.permanent), (card) => { return card.name === buyer.card.name()})) {
      let colonnade_stack = _.find(game.landmarks, (card) => {
        return card.name === 'Colonnade'
      })

      let victory_tokens = Math.min(2, colonnade_stack.victory_tokens)
      colonnade_stack.victory_tokens = Math.max(0, colonnade_stack.victory_tokens - 2)

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
