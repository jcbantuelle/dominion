Triumph = class Triumph extends Event {

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 5
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
    let gained = card_gainer.gain()

    if (gained) {
      let victory_tokens = _.size(game.turn.gained_cards)
      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.victory_tokens += victory_tokens
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.victory_tokens += victory_tokens
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
      }
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(new Estate(game))} to gain`)
    }
  }
}
