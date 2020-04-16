Windfall = class Windfall extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      _.times(3, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
        card_gainer.gain()
      })
    }
  }

}
