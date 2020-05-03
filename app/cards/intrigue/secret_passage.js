SecretPassage = class SecretPassage extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 4
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(2)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    GameModel.update(game._id, game)
    PlayerCardsModel.update(game._id, player_cards)

    if (_.size(player_cards.hand) > 1) {
      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: `Choose a card to place in your deck:`,
        cards: player_cards.hand,
        minimum: 1,
        maximum: 1
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(SecretPassage.choose_card_to_place_in_deck)
    } else if (_.size(player_cards.hand) === 1) {
      SecretPassage.choose_card_to_place_in_deck(game, player_cards, player_cards.hand)
    } else {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    }
  }

  static choose_card_to_place_in_deck(game, player_cards, selected_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'overpay',
      player_cards: true,
      instructions: `Choose where in your deck to put ${CardView.render(selected_cards[0])} (1 is top of deck):`,
      minimum: 1,
      maximum: _.size(player_cards.deck) + 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, selected_cards[0])
    turn_event_processor.process(SecretPassage.insert_in_deck)
  }

  static insert_in_deck(game, player_cards, location, selected_card) {
    let card_mover = new CardMover(game, player_cards)
    card_mover.move(player_cards.hand, player_cards.deck, selected_card, Number(location) - 1)
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts ${CardView.render(selected_card)} in their deck as card #${location}`)
  }

}
