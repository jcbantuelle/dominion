Traveller = class Traveller extends Card {

  choose_exchange(game, player_cards, old_card, new_card) {
    let traveller_stack = _.find(game.cards, function(card) {
      return card.name === new_card
    })
    if (traveller_stack.count > 0) {
      let exchange_card = this
      if (old_card === 'Estate') {
        exchange_card = _.find(player_cards.discarding, function(card) {
          return card.name === 'Estate'
        })
      }
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_yes_no',
        instructions: `Exchange ${CardView.render(exchange_card)} for ${CardView.render(traveller_stack)}?`,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {old_card: old_card, new_card: new_card})
      turn_event_processor.process(Traveller.exchange_card)
    }
  }

  static exchange_card(game, player_cards, response, exchange) {
    if (response === 'yes') {
      let old_card_index = _.findIndex(player_cards.discarding, function(card) {
        return card.name === exchange.old_card
      })

      if (old_card_index !== -1) {
        let old_card_pile = _.find(game.cards, function(card) {
          return card.name === exchange.old_card
        })
        let old_card = player_cards.discarding.splice(old_card_index, 1)[0]
        if (old_card.name === 'Estate') {
          old_card = ClassCreator.create('Estate').to_h()
        }

        old_card_pile.count += 1
        old_card_pile.stack.unshift(old_card)
        old_card_pile.top_card = _.first(old_card_pile.stack)

        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> returns ${CardView.render(old_card)}`)

        let card_gainer = new CardGainer(game, player_cards, 'discard', exchange.new_card)
        card_gainer.gain_game_card()
      }
    }
  }

}
