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
    let victory_token_gainer = new VictoryTokenGainer(event_handler.game, event_handler.player_cards)
    victory_token_gainer.gain(1)

    let card_gainer = new CardGainer(event_handler.game, event_handler.player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
