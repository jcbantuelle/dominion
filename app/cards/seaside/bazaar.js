Bazaar = class Bazaar extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(2)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1)
  }

}
