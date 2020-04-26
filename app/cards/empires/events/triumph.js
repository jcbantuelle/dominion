Triumph = class Triumph extends Event {

  coin_cost() {
    return 0
  }

  debt_cost() {
    return 5
  }

  buy(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
    if (card_gainer.gain()) {
      let victory_tokens = _.size(game.turn.gained_cards)
      let victory_token_gainer = new VictoryTokenGainer(game, player_cards)
      victory_token_gainer.gain(victory_tokens)
    } else {
      game.log.push(`&nbsp;&nbsp;but there is no ${CardView.render(new Estate(game))} to gain`)
    }
  }
}
