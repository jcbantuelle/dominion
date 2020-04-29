SnowyVillage = class SnowyVillage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(4)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    game.turn.no_more_actions = true
  }

}
