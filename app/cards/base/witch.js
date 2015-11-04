Witch = class Witch extends Card {

  types() {
    return ['action', 'attack']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)
  }

  attack(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, 'Curse')
    card_gainer.gain_common_card()
  }

}
