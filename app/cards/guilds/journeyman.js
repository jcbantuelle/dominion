Journeyman = class Journeyman extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      let unique_cards = _.uniq(AllPlayerCardsQuery.find(player_cards), function(card) {
        return card.name
      })

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Name a card:',
        cards: unique_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Journeyman.name_card)

      this.reveal(game, player_cards)

      player_cards.hand = player_cards.hand.concat(player_cards.revealed_hand_cards)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(player_cards.revealed_hand_cards)} in their hand`)

      let card_discarder = new CardDiscarder(game, player_cards, 'revealed')
      card_discarder.discard()

      delete game.turn.journeyman_named_card
      delete player_cards.revealed_hand_cards
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  reveal(game, player_cards) {
    let revealed_cards = []
    player_cards.revealed_hand_cards = []
    while((_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) && _.size(player_cards.revealed_hand_cards) < 3) {
      if (_.size(player_cards.deck) === 0) {
        DeckShuffler.shuffle(player_cards)
      }
      let card = player_cards.deck.shift()
      revealed_cards.push(card)
      if (card.name !== game.turn.journeyman_named_card.name) {
        player_cards.revealed_hand_cards.push(card)
      } else {
        player_cards.revealed.push(card)
      }
    }
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(revealed_cards)}`)
  }

  static name_card(game, player_cards, selected_cards) {
    game.turn.journeyman_named_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(game.turn.journeyman_named_card)}`)
  }

}
