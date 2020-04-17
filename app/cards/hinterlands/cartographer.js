Cartographer = class Cartographer extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards) {
    let card_drawer = new CardDrawer(game, player_cards)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    if (_.size(player_cards.deck) === 0 && _.size(player_cards.discard) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in deck`)
    } else {
      let card_revealer = new CardRevealer(game, player_cards)
      card_revealer.reveal_from_deck(4, false)

      GameModel.update(game._id, game)
      PlayerCardsModel.update(game._id, player_cards)

      let turn_event_id = TurnEventModel.insert({
        game_id: game._id,
        player_id: player_cards.player_id,
        username: player_cards.username,
        type: 'choose_cards',
        player_cards: true,
        instructions: 'Choose any number of cards to discard:',
        cards: player_cards.revealed,
        minimum: 0,
        maximum: 0
      })
      let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
      turn_event_processor.process(Cartographer.discard_cards)
    }
  }

  static discard_cards(game, player_cards, selected_cards) {
    let card_discarder = new CardDiscarder(game, player_cards, 'revealed', selected_cards)
    card_discarder.discard()

    let card_returner = new CardReturner(game, player_cards)
    card_returner.return_to_deck(player_cards.revealed)
  }

}



