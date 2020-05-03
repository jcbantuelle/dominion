Sheepdog = class Sheepdog extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)
  }

  gain_reaction(game, player_cards, gainer, sheepdog) {
    let card_player = new CardPlayer(game, player_cards, sheepdog)
    card_player.play(true)
  }

}
