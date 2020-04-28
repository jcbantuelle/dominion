Sleigh = class Sleigh extends Card {

  types() {
    return ['action', 'reaction']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    _.times(2, function() {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Horse')
      card_gainer.gain()
    })
  }

  gain_reaction(game, player_cards, gainer, sleigh) {
    let card_discarder = new CardDiscarder(game, player_cards, 'hand', sleigh)
    card_discarder.discard()

    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose Where To Place ${CardView.render(gainer.gained_card)}:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: 'Hand', value: 'hand'},
        {text: 'Deck', value: 'deck'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    let response = turn_event_processor.process(Sleigh.process_response)

    let new_destination_text = response === 'deck' ? 'on top of their deck' : 'in their hand'
    let card_mover = new CardMover(game, player_cards)
    if (card_mover.move(player_cards[gainer.destination], player_cards[response], gainer.gained_card)) {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(gainer.gained_card)} ${new_destination_text}`)
      gainer.destination = response
    }
  }

  static process_response(game, player_cards, response) {
    return response[0]
  }

}
