Moat = class Moat extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(2)

    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

  attack_reaction(game, player_cards) {
    player_cards.moat = true
  }

}
