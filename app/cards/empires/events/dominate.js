Dominate = class Dominate extends Event {

  coin_cost() {
    return 14
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Province')

    if (card_gainer.gain()) {
      let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
      victory_token_gainer.gain(9)
    }
  }

}
