Masterpiece = class Masterpiece extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)
  }

  buy_event(buyer) {
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

  static overpay(game, player_cards, amount) {
    amount = Number(amount)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> overpays by $${amount}`)
    game.turn.coins -= amount

    _.times(amount, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    })
  }

}
