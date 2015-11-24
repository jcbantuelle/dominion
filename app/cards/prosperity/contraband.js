Contraband = class Contraband extends Card {

  types() {
    return ['treasure']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.coins += 3
    game.turn.buys += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 buy`)

    let eligible_cards = _.reduce(game.cards, function(cards, card) {
      cards = cards.concat(_.uniq(card.stack, function(stack_card) {
        return stack_card.name
      }))
      return cards
    }, [])

    if (_.size(eligible_cards) > 0) {
      let player_to_left = TurnOrderedPlayerCardsQuery.turn_ordered_player_cards(game)[1]

      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_to_left.player_id,
        username: player_to_left.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card for ${CardView.render(this)}:`,
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_to_left, turn_event_id)
      turn_event_processor.process(Contraband.choose_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to contraband`)
    }
  }

  static choose_card(game, player_cards, selected_cards) {
    game.turn.contraband.push(selected_cards[0].name)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> selects ${CardView.render(selected_cards)} as ${CardView.card_html('treasure', 'Contraband')}`)
  }

}