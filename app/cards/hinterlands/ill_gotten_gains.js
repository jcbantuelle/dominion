IllGottenGains = class IllGottenGains extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    CoinGainer.gain(game, player_cards, 1)

    GameModel.update(game._id, game)

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Gain a ${CardView.card_html('treasure', 'Copper')}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(IllGottenGains.gain_copper)
  }

  static gain_copper(game, player_cards, response) {
    if (response === 'yes') {
      let card_gainer = new CardGainer(game, player_cards, 'hand', 'Copper')
      card_gainer.gain_game_card()
    }
  }

  gain_event(gainer) {
    let ordered_player_cards = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(gainer.game)
    ordered_player_cards.shift()
    _.each(ordered_player_cards, function(other_player_cards) {
      let card_gainer = new CardGainer(gainer.game, other_player_cards, 'discard', 'Curse')
      card_gainer.gain_game_card()
      PlayerCardsModel.update(gainer.game._id, other_player_cards)
    })
  }

}
