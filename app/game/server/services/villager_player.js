VillagerPlayer = class VillagerPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    if (this.can_play()) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> plays a Villager`)
      this.player_cards.villagers -= 1
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  can_play() {
    return this.game.turn.phase === 'action' && this.player_cards.villagers > 0
  }

}
