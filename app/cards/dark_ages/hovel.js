Hovel = class Hovel extends Card {

  is_purchasable() {
    return false
  }

  types() {
    return ['reaction', 'shelter']
  }

  coin_cost() {
    return 1
  }

  buy_reaction(game, player_cards, buyer, card) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', card)
    card_trasher.trash()
  }

}
