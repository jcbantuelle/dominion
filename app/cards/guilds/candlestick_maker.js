CandlestickMaker = class CandlestickMaker extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.turn.buys += 1
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.coin_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action, +1 buy, and <strong>${possessing_player_cards.username}</strong> takes a coin token`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.coin_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action, +1 buy, and takes a coin token`)
    }
  }

}
