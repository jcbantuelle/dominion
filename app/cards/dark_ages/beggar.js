Beggar = class Beggar extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    _.times(3, function() {
      let card_gainer = new CardGainer(game, player_cards, 'hand', 'Copper')
      card_gainer.gain()
    })
  }

  attack_event(game, player_cards, beggar) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', beggar)
    card_discarder.discard()

    let card_gainer = new CardGainer(game, player_cards, 'deck', 'Silver')
    card_gainer.gain()

    card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
    card_gainer.gain()
  }

}
