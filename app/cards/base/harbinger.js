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

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.discard) > 0) {
      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose a card to place on top of your deck (or none to skip):',
        cards: player_cards.discard,
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
      let card_mover = new CardMover(game, player_cards)
      card_mover.move(player_cards.discard, player_cards.deck, selected_cards[0])

      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> places ${CardView.render(selected_cards[0])} on top of their deck`)
    }
  }

}
