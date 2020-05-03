Conspirator = class Conspirator extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(2)

    if (_.size(game.turn.played_actions) > 2) {
      let card_drawer = new CardDrawer(game, player_cards, card_player)
      card_drawer.draw(1)

      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(1)
    }
  }

}
