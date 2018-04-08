Haunting = class Haunting extends Hex {

  receive(game, player_cards) {
    if (_.size(player_cards.hand) > 3) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put on top of your deck:',
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Haunting.return_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but only has ${_.size(player_cards.hand)} cards in hand`)
    }
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let returned_card_index = _.findIndex(player_cards.hand, function(card) {
      return card.name === selected_cards[0].name
    })
    let returned_card = player_cards.hand.splice(returned_card_index, 1)[0]
    player_cards.deck.unshift(returned_card)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places a card back on their deck`)
  }

}
