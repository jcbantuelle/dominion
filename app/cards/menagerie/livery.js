Livery = class Livery extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards, card_player)
    coin_gainer.gain(3)
    
    game.turn.liveries += 1
  }

  gain_event(gainer) {
    let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'discard', 'Horse')
    card_gainer.gain()
  }

}
