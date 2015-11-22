Cache = class Cache extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.coins += 3
  }

  gain_event(gainer) {
    _.times(2, function() {
      let card_gainer = new CardGainer(gainer.game, gainer.player_cards, 'deck', 'Copper')
      card_gainer.gain_game_card()
    })
  }
}
