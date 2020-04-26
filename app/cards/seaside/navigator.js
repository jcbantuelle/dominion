Navigator = class Navigator extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(2)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(5, false)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_options',
        instructions: `${CardView.render(player_cards.revealed)}`,
        minimum: 1,
        maximum: 1,
        options: [
          {text: 'Discard all cards', value: 'discard'},
          {text: 'Return cards to deck', value: 'deck'}
        ]
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Navigator.process_response)
    }
  }

  static process_response(game, player_cards, response) {
    if (response[0] === 'discard') {
      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()
    } else if (response[0] === 'deck') {
      let card_returner = new CardReturner(game, player_cards)
      card_returner.return_to_deck(player_cards.revealed)
    }
  }

}
