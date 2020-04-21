Estate = class Estate extends Card {

  types() {
    return ['victory']
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
