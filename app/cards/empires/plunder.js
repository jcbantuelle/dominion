Plunder = class Plunder extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  stack_name() {
    return 'Encampment/Plunder'
  }

  play(game, player_cards) {
    let gained_coins = CoinGainer.gain(game, player_cards, 2)

    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 &nabla;`)
    }
  }

}
