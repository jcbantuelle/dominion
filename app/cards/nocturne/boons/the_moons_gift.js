TheMoonsGift = class TheMoonsGift extends Boon {

  receive(game, player_cards) {
    if (_.size(player_cards.discard) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to put on top of your deck (Or none to skip):',
        cards: player_cards.discard,
        minimum: 0,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(TheMoonsGift.put_on_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in the discard`)
    }
  }

  static put_on_deck(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but chooses not to put a card on their deck`)
    } else {
      let discard_card_index = _.findIndex(player_cards.discard, function(card) {
        return card.name === selected_cards[0].name
      })

      player_cards.deck.unshift(player_cards.discard.splice(discard_card_index, 1)[0])
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts a card from their discard on top of their deck`)
    }
  }

}
