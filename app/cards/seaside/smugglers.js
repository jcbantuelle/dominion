Smugglers = class Smugglers extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.turn.last_player_gained_cards, function(gained_card) {
      let game_stack = _.find(game.cards, function(stack) {
        return stack.name === gained_card.stack_name
      })
      return game_stack.top_card.coin_cost <= 6 && game_stack.top_card.potion_cost === 0
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Smugglers.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> selects ${CardView.render(selected_card)}`)

    let game_stack = _.find(game.cards, function(stack) {
      return stack.name === selected_card.stack_name
    })

    if (game_stack.count > 0 && game_stack.top_card.purchasable && game_stack.top_card.name === selected_card.name) {
      let card_gainer = new CardGainer(game, player_cards.username, player_cards.discard, selected_card.name)
      card_gainer.gain_game_card()
    } else {
      game.log.push(`&nbsp;&nbsp;but can not gain a copy of it`)
    }
  }

}
