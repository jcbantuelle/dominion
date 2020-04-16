CrumblingCastle = class CrumblingCastle extends Castles {

  coin_cost() {
    return 4
  }

  victory_points(player_cards) {
    return 1
  }

  gain_event(gainer) {
    this.gain_victory_token_and_silver(gainer)
  }

  trash_event(trasher) {
    this.gain_victory_token_and_silver(trasher)
  }

  gain_victory_token_and_silver(event_handler) {
    if (event_handler.game.turn.possessed) {
      possessing_player_cards = PlayerCardsModel.findOne(event_handler.game._id, event_handler.game.turn.possessed._id)
      possessing_player_cards.victory_tokens += 1
      event_handler.game.log.push(`&nbsp;&nbsp;<strong>${possessing_player_cards.username}</strong> gets +1 &nabla;`)
      PlayerCardsModel.update(event_handler.game._id, possessing_player_cards)
    } else {
      event_handler.player_cards.victory_tokens += 1
      event_handler.game.log.push(`&nbsp;&nbsp;<strong>${event_handler.player_cards.username}</strong> gets +1 &nabla;`)
    }
    let card_gainer = new CardGainer(event_handler.game, event_handler.player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
