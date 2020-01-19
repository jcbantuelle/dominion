Leprechaun = class Leprechaun extends Card {

  types() {
    return ['action', 'doom']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain_game_card()

    if (_.size(player_cards.playing.concat(player_cards.in_play).concat(player_cards.duration).concat(player_cards.permanent)) === 7) {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Wish')
      card_gainer.gain_game_card()
    } else {
      let hex_receiver = new EffectReceiver(game, player_cards, 'hex')
      hex_receiver.receive()
    }
  }

}
