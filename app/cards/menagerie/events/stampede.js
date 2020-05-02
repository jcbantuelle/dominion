Stampede = class Stampede extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    if (_.size(player_cards.in_play) < 6) {
      _.times(5, () => {
        let card_gainer = new CardGainer(game, player_cards, 'deck', 'Horse')
        card_gainer.gain() 
      })
    }
  }

}
