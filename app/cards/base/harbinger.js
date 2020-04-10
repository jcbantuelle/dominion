Harbinger = class Harbinger extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    game.turn.actions += 1
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action`)

    let eligible_cards = player_cards.discard

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on top of your deck (Or none to skip):',
        cards: eligible_cards,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Harbinger.place_card_on_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but does not place a card on their deck`)
    }
  }

  static place_card_on_deck(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not place a card on their deck`)
    } else {
      let selected_card = selected_cards[0]
      let card_index = _.findIndex(player_cards.discard, function(card) {
        return card.id === selected_card.id
      })

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${CardView.render(selected_card)} on top of their deck`)

      player_cards.deck.unshift(player_cards.discard[card_index])
      player_cards.discard.splice(card_index, 1)
    }
  }

}
