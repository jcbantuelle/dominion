Commerce = class Commerce extends Event {

  coin_cost() {
    return 5
  }

  buy(game, player_cards) {
    let unique_gained_cards = _.uniqBy(game.turn.gained_cards, 'name')
    _.times(_.size(unique_gained_cards), () => {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
      card_gainer.gain()   
    })
  }

}
