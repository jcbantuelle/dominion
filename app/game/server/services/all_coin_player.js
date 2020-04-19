AllCoinPlayer = class AllCoinPlayer {

  static bulk_playable_treasures() {
    return ['Copper', 'Silver', 'Gold', 'Platinum', 'Fools Gold', 'Cache', 'Potion', 'Philosophers Stone', 'Harem', 'Diadem', 'Masterpiece', 'Stash', 'Plunder', 'Humble Castle', 'Pouch', 'Haunted Mirror', 'Pasture', 'Royal Seal']
  }

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
  }

  play() {
    let playable_cards = this.find_playable_cards()
    if (_.size(playable_cards) > 0) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> plays ${CardView.render(playable_cards)}`)
      _.each(playable_cards, (card) => {
        let card_player = new CardPlayer(this.game, this.player_cards, card)
        card_player.play_without_announcement()
      })
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  find_playable_cards() {
    return _.filter(this.player_cards.hand, (card) => {
      return _.includes(AllCoinPlayer.bulk_playable_treasures(), card.name)
    })
  }

}
