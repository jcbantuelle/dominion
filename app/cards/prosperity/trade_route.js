TradeRoute = class TradeRoute extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to trash:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(TradeRoute.trash_card)
    } else if (_.size(player_cards.hand) === 1) {
      TradeRoute.trash_card(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
    }

    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(game.trade_route_tokens)
  }

  gain_event(gainer, trade_route) {
    gainer.game_card.has_trade_route_token = false
    gainer.game.trade_route_tokens += 1
    gainer.game.log.push(`&nbsp;&nbsp;The ${CardView.render(gainer.gained_card)} Coin token is moved to the ${CardView.render(trade_route)} mat`)
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
