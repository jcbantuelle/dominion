WineMerchant = class WineMerchant extends Reserve {

  types() {
    return this.capitalism_types(['action', 'reserve'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(4)

    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  end_buy_event(game, player_cards, wine_merchant) {
    if (game.turn.coins >= 2) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Discard ${CardView.render(wine_merchant)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, wine_merchant)
      turn_event_processor.process(WineMerchant.discard_card)
    }
  }

  static discard_card(game, player_cards, response, wine_merchant) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'tavern', wine_merchant)
      card_discarder.discard()
    }
  }

}
