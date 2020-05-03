Bard = class Bard extends Card {

  types() {
    return this.capitalism_types(['action', 'fate'])
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

    let boon_receiver = new EffectReceiver(game, player_cards, 'boon')
    boon_receiver.receive()
  }

}
