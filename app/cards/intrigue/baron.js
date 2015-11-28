Baron = class Baron extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let estates = _.filter(player_cards.hand, function(card) {
      return card.name === 'Estate'
    })

    if (!_.isEmpty(estates)) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Discard an ${CardView.card_html('victory', 'Estate')}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Baron.discard_estate)
    } else {
      Baron.gain_estate(game, player_cards)
    }
  }

  static discard_estate(game, player_cards, response) {
    if (response === 'yes') {
      let estate = _.find(player_cards.hand, function(card) {
        return card.name === 'Estate'
      })
      let card_discarder = new CardDiscarder(game, player_cards, 'hand')
      card_discarder.discard_some([estate])

      game.turn.coins += 4
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$4`)
    } else {
      Baron.gain_estate(game, player_cards)
    }
  }

  static gain_estate(game, player_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'discard', 'Estate')
    card_gainer.gain_game_card()
  }

}
