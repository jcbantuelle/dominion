Capital = class Capital extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(6)

    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)
  }

  discard_event(discarder, capital) {
    let debt_token_gainer = new DebtTokenGainer(discarder.game, discarder.player_cards, capital)
    debt_token_gainer.gain(6)

    let max_payable_debt = Math.min(discarder.game.turn.coins, discarder.player_cards.debt_tokens)
    if (max_payable_debt > 0) {
      GameModel.update(discarder.game._id, discarder.game)
      PlayerCardsModel.update(discarder.game._id, discarder.player_cards)
      let turn_event_id = TurnEventModel.insert({
        game_id: discarder.game._id,
        player_id: discarder.player_cards.player_id,
        username: discarder.player_cards.username,
        type: 'overpay',
        instructions: `Pay off debt:`,
        minimum: 0,
        maximum: max_payable_debt
      })
      let turn_event_processor = new TurnEventProcessor(discarder.game, discarder.player_cards, turn_event_id)
      turn_event_processor.process(Capital.pay_debt)
    }
  }

  static pay_debt(game, player_cards, amount) {
    amount = Number(amount)
    if (amount > 0) {
      game.turn.coins -= amount
      player_cards.debt_tokens -= amount
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> pays off ${amount} debt`)
    }
  }

}
