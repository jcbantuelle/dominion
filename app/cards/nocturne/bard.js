Bard = class Bard extends Card {

  types() {
    return ['action', 'fate']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    let boon_receiver = new EffectReceiver(game, player_cards, 'boon')
    boon_receiver.receive()
  }

}
