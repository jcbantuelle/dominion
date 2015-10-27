Smithy = class Smithy extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(player_cards, game);
    [player_cards, game] = card_drawer.draw(3)
    Games.update(game._id, game)
    PlayerCards.update(player_cards._id, player_cards)
  }

}
