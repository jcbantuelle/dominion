Hovel = class Hovel extends Card {

  types() {
    return ['reaction', 'shelter']
  }

  coin_cost() {
    return 1
  }

  buy_reaction(game, player_cards, buyer, hovel) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', hovel)
    card_trasher.trash()
  }

}
