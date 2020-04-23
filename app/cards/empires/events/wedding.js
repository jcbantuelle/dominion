Wedding = class Wedding extends Event {

  coin_cost() {
    return 4
  }

  debt_cost() {
    return 3
  }

  buy(game, player_cards) {
    let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
    victory_token_gainer.gain(1)

    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Gold')
    card_gainer.gain()
  }

}
