Steward = class Steward extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let turn_event_id = TurnEvents.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+2 cards', value: 'cards'},
        {text: '+$2', value: 'coins'},
        {text: 'Trash 2 cards', value: 'trash'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Steward.process_choice)
  }

  static process_choice(game, player_cards, choice) {
    choice = choice[0]
    if (choice === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)
    } else if (choice === 'coins') {
      game.turn.coins += 2
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$2`)
    } else if (choice === 'trash') {
      if (_.size(player_cards.hand) > 2) {
        let turn_event_id = TurnEvents.insert({
          game_id: game._id,
          player_id: player_cards.player_id,
          username: player_cards.username,
          type: 'choose_cards',
          player_cards: true,
          instructions: 'Choose 2 cards to trash:',
          cards: player_cards.hand,
          minimum: 2,
          maximum: 2
        })
        let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
        turn_event_processor.process(Steward.trash_cards)
      } else {
        Steward.trash_cards(game, player_cards, player_cards.hand)
      }
    }
  }

  static trash_cards(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but does not trash anything`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', _.pluck(selected_cards, 'name'))
      card_trasher.trash()
    }
  }

}
