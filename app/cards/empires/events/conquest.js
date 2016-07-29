Conquest = class Conquest extends Event {

  coin_cost() {
    return 6
  }

  buy(game, player_cards) {
    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    })

    let gained_silvers = _.filter(game.turn.gained_cards, function(card) {
      return card.name === 'Silver'
    })

    let victory_tokens = _.size(gained_silvers)

    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += victory_tokens
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += victory_tokens
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +${victory_tokens} &nabla;`)
    }
  }

}
