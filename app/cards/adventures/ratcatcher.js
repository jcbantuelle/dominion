Ratcatcher = class Ratcatcher extends Reserve {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let card_drawer = new CardDrawer(game, player_cards, card_player)
    card_drawer.draw(1)

    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  reserve(game, player_cards, ratcatcher) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(ratcatcher)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, ratcatcher)
    turn_event_processor.process(Ratcatcher.call_card)
  }

  static call_card(game, player_cards, response, ratcatcher) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, ratcatcher)

      if (_.size(player_cards.hand) > 1) {
        let turn_event_id = TurnEventModel.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose a card to trash:',
          cards: player_cards.hand,
          minimum: 1,
          maximum: 1
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Ratcatcher.trash_card)
      } else if (_.size(player_cards.hand) === 1) {
        Ratcatcher.trash_card(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;but there are no cards in hand`)
      }
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
