AllCoinPlayer = class AllCoinPlayer {

  constructor(game, player_cards) {
    this.game = game
    this.player_cards = player_cards
    this.bulk_playable_treasures = ['Copper', 'Silver', 'Gold', 'Platinum', 'Fools Gold', 'Cache', 'Potion', 'Philosophers Stone', 'Harem', 'Diadem']
  }

  play() {
    let played_cards = _.map(this.find_playable_cards(), (card) => {
      let card_player = new CardPlayer(this.game, this.player_cards, card.name)
      card_player.play(false)
      return card
    })
    if (_.size(played_cards) > 0) {
      this.game.log.push(`<strong>${this.player_cards.username}</strong> plays ${CardView.render(played_cards)}`)
      GameModel.update(this.game._id, this.game)
      PlayerCardsModel.update(this.game._id, this.player_cards)
    }
  }

  find_playable_cards() {
    return _.filter(this.player_cards.hand, (card) => {
      return _.contains(this.bulk_playable_treasures, card.name)
    })
  }

}
