DebtTokenPlayer = class DebtTokenPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    if (this.can_play()) {
      this.update_phase()
      this.game.log.push(`<strong>${this.player_cards.username}</strong> pays off a debt token`)
      this.player_cards.debt_tokens -= 1
      this.game.turn.coins -= 1
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (_.includes(['action', 'treasure'], this.game.turn.phase)) {
      let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
      start_buy_event_processor.process()
      this.game.turn.phase = 'buy'
    }
  }

  can_play() {
    return this.player_cards.debt_tokens > 0 && this.game.turn.coins > 0
  }

}
