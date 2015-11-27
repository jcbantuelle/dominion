Courtyard = class Courtyard extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(3)

    PlayerCards.update(player_cards._id, player_cards)

    if (_.size(player_cards.hand) > 0) {
      let turn_event_id = TurnEvents.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on deck:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      return turn_event_processor.process(Courtyard.return_card_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in their hand`)
    }
  }

  static return_card_to_deck(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    let card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_card.name
    })

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places a card on top of their deck`)

    player_cards.deck.unshift(player_cards.hand[card_index])
    player_cards.hand.splice(card_index, 1)
  }

}
