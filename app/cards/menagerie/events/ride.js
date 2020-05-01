Ride = class Ride extends Event {

  coin_cost() {
    return 2
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
    card_gainer.gain() 
  }

}
