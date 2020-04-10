Artisan = class Artisan extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 6
  }

  play(game, player_cards) {
    let eligible_cards = _.filter(game.cards, function(card) {
      return card.count > 0 && card.top_card.purchasable && CardCostComparer.coin_less_than(game, card.top_card, 6)
    })

    if (_.size(eligible_cards) > 0) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        game_cards: true,
        instructions: 'Choose a card to gain:',
        cards: eligible_cards,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Artisan.gain_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no available cards to gain`)
    }

    if (_.size(player_cards.hand) === 1) {
      Artisan.return_to_deck(game, player_cards, player_cards.hand)
    } else if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to put on top of your deck:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Artisan.return_to_deck)
    } else {
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> has no cards in hand to discard`)
    }
  }

  static gain_card(game, player_cards, selected_cards) {
    let card_gainer = new CardGainer(game, player_cards, 'hand', selected_cards[0].name)
    card_gainer.gain_game_card()
    PlayerCardsModel.update(game._id, player_cards)
  }

  static return_to_deck(game, player_cards, selected_cards) {
    let returned_card_index = _.findIndex(player_cards.hand, function(card) {
      return card.id === selected_cards[0].id
    })
    let returned_card = player_cards.hand.splice(returned_card_index, 1)[0]
    player_cards.deck.unshift(returned_card)

    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places a card back on their deck`)
  }

}
