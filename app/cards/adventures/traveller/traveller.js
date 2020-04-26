Traveller = class Traveller extends Card {

  choose_exchange(game, player_cards, old_card, new_card_name) {
    let traveller_stack = _.find(game.cards, function(card) {
      return card.name === new_card_name
    })
    if (traveller_stack.count > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Exchange ${CardView.render(old_card)} for ${CardView.render(traveller_stack)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {old_card: old_card, new_card_name: new_card_name})
      turn_event_processor.process(Traveller.exchange_card)
    }
  }

  static exchange_card(game, player_cards, response, exchange) {
    if (response === 'yes') {
      let card_mover = new CardMover(game, player_cards)
      if (card_mover.return_to_supply(player_cards.in_play, exchange.old_card.name, [exchange.old_card])) {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(exchange.old_card)}`)
        let card_gainer = new CardGainer(game, player_cards, 'discard', exchange.new_card_name)
        card_gainer.gain()
      }
    }
  }

}
