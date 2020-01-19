VillagerPlayer = class VillagerPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    if (this.can_play()) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> uses a villager, gets +1 action`)
      this.player_cards.villagers -= 1
      this.game.turn.actions += 1
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  can_play() {
    return _.includes(['action'], this.game.turn.phase) && this.player_cards.villagers > 0
  }

}
