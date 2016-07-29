Dominate = class Dominate extends Event {

  coin_cost() {
    return 14
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Province')

    if (card_gainer.gain_game_card()) {
      if (game.turn.possessed) {
        possessing_player_cards = PlayerCardsModel.findOne(game._id, game.turn.possessed._id)
        possessing_player_cards.victory_tokens += 9
        game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +9 &nabla;`)
        PlayerCardsModel.update(game._id, possessing_player_cards)
      } else {
        player_cards.victory_tokens += 9
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +9 &nabla;`)
      }
    }
  }

}
