Groundskeeper = class Groundskeeper extends Card {

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
    action_gainer.gain(1)
  }

  gain_event(gainer, groundskeeper) {
    let victory_token_gainer = new VictoryTokenGainer(gainer.game, gainer.player_cards, groundskeeper)
    victory_token_gainer.gain(1)
  }

}
