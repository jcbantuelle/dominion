Explorer = class Explorer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let province = _.find(player_cards.hand, function(card) {
      return card.name === 'Province'
    })

    if (province) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: 'Reveal Province?',
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Explorer.reveal_province)
    } else {
      Explorer.gain_card(game, player_cards, 'Silver')
    }
  }

  static reveal_province(game, player_cards, response) {
    if (response === 'yes') {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.card_html('victory', 'Province')}`)
      Explorer.gain_card(game, player_cards, 'Gold')
    } else {
      Explorer.gain_card(game, player_cards, 'Silver')
    }
  }

  static gain_card(game, player_cards, card_name) {
    let card_gainer = new CardGainer(game, player_cards.username, player_cards.hand, card_name)
    card_gainer.gain_game_card()
    game.log.push(`&nbsp;&nbsp;putting it in hand`)
  }

}
