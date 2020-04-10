WineMerchant = class WineMerchant extends Card {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, player) {
    game.turn.buys += 1
    let gained_coins = CoinGainer.gain(game, player_cards, 4)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy and +$${gained_coins}`)
    this.move_to_tavern(game, player_cards, player.played_card)
  }

  end_buy_event(game, player_cards, card) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Discard ${CardView.render(card)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, card)
    turn_event_processor.process(WineMerchant.discard_card)
  }

  static discard_card(game, player_cards, response, card) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'tavern', card)
      card_discarder.discard()
    }
  }

}
