Fair = class Fair extends Project {

  coin_cost() {
    return 4
  }

  start_turn_event(game, player_cards, fair) {
    let buy_gainer = new BuyGainer(game, player_cards, fair)
    buy_gainer.gain(1)
  }

}
