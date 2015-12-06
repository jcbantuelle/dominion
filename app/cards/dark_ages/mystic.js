Mystic = class Mystic extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    game.turn.actions += 1
    game.turn.coins += 2
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +1 action and +$2`)

    if (_.size(player_cards.deck) > 0 || _.size(player_cards.discard) > 0) {
      PlayerCardsModel.update(game._id, player_cards)

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
      turn_event_processor.process(Mystic.name_card)
    } else {
      game.log.push(`&nbsp;&nbsp;but there are no cards in deck to reveal`)
    }
  }

  static name_card(game, player_cards, selected_cards) {
    let selected_card = selected_cards[0]
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> names ${CardView.render(selected_card)}`)

    if (_.isEmpty(player_cards.deck)) {
      DeckShuffler.shuffle(player_cards)
    }

    let top_card = player_cards.deck[0]
    let log_message = `&nbsp;&nbsp;<strong>${player_cards.username}</strong> reveals ${CardView.render(top_card)}`

    if (top_card.name === selected_card.name) {
      player_cards.hand.push(player_cards.deck.shift())
      log_message += ', putting it in their hand'
    } else {
      log_message += ', putting it back on top of their deck'
    }

    game.log.push(log_message)
  }

}
