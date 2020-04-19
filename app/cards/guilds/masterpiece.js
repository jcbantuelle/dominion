Masterpiece = class Masterpiece extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
  }

  buy_event(buyer) {
    if (buyer.game.turn.coins > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: buyer.game._id,
        player_id: buyer.player_cards.player_id,
        username: buyer.player_cards.username,
        type: 'overpay',
        player_cards: true,
        instructions: 'Choose an amount to overpay by:',
        minimum: 0,
        maximum: buyer.game.turn.coins
      })
      let turn_event_processor = new TurnEventProcessor(buyer.game, buyer.player_cards, turn_event_id)
      turn_event_processor.process(Masterpiece.overpay)
    }
  }

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    if (amount > 0) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
      game.turn.coins -= amount

      _.times(amount, function() {
        let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
        card_gainer.gain()
      })
    } else {
      game.log.push(`&nbsp;&nbsp;but does not overpay`)
    }
  }

}
