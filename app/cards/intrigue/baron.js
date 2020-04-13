Baron = class Baron extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let buy_gainer = new BuyGainer(game, player_cards)
    buy_gainer.gain(1)

    let estate = _.find(player_cards.hand, function(card) {
      return card.name === 'Estate'
    })

    if (estate) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Discard an ${CardView.render(estate)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, estate)
      turn_event_processor.process(Baron.discard_estate)
    } else {
      Baron.gain_estate(game, player_cards)
    }
  }

  static discard_estate(game, player_cards, response, estate) {
    if (response === 'yes') {
      let card_discarder = new CardDiscarder(game, player_cards, 'hand', estate)
      card_discarder.discard()

      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(4)
    } else {
      Baron.gain_estate(game, player_cards)
    }
  }

  static gain_estate(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
    card_gainer.gain_game_card()
  }

}
