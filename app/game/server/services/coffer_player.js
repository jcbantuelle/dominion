CofferPlayer = class CofferPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    if (this.can_play()) {
      this.update_phase()
      this.game.log.push(`<strong>${this.player_cards.username}</strong> plays a Coffer`)
      this.player_cards.coffers -= 1
      let coin_gainer = new CoinGainer(this.game, this.player_cards)
      coin_gainer.gain(1)
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  update_phase() {
    if (this.game.turn.phase !== 'treasure') {
      this.game.turn.phase = 'treasure'
      let start_buy_event_processor = new StartBuyEventProcessor(this.game, this.player_cards)
      start_buy_event_processor.process()
    }
  }

  can_play() {
    return _.includes(['action', 'treasure'], this.game.turn.phase) && this.player_cards.coffers > 0
  }

}
