Wedding = class Wedding extends Event {

  coin_cost() {
    return 4
  }

  debt_cost() {
    return 3
  }

  buy(game, player_cards) {
    if (game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
      PlayerCardsModel.update(game._id, possessing_player_cards)
    } else {
      player_cards.victory_tokens += 1
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 &nabla;`)
    }

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()
  }

}
