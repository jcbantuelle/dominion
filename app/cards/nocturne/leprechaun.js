Leprechaun = class Leprechaun extends Card {

  types() {
    return ['action', 'doom']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()

    if (_.size(player_cards.in_play) === 7) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Wish')
      card_gainer.gain()
    } else {
      let hex_receiver = new EffectReceiver(game, player_cards, 'hex')
      hex_receiver.receive()
    }
  }

}
