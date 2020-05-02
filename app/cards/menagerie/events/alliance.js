Alliance = class Alliance extends Event {

  coin_cost() {
    return 10
  }

  buy(game, player_cards) {
    _.each(['Province', 'Duchy', 'Estate', 'Gold', 'Silver', 'Copper'], (card_name) => {
      let card_gainer = new CardGainer(game, player_cards, 'discard', card_name)
      card_gainer.gain()  
    })
  }

}
