Estate = class Estate extends Card {

  types() {
    let card_types = ['victory']
    if (this.game) {
      let player_cards = PlayerCardsModel.findOne(this.game._id, this.game.turn.player._id)
      if (!_.isEmpty(player_cards.inheritance)) {
        card_types.push('action')
      }
    }
    return card_types
  }

  coin_cost() {
    return 2
  }

  victory_points() {
    return 1
  }

  play(game, player_cards, card_player) {
    let inherited_card_player = new CardPlayer(game, player_cards, player_cards.inheritance[0], card_player.card)
    inherited_card_player.play(true, false)
  }

}
