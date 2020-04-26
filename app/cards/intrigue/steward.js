Steward = class Steward extends Card {

  types() {
    return this.capitalism_types(['action'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
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
    if (choice[0] === 'cards') {
      let card_drawer = new CardDrawer(game, player_cards)
      card_drawer.draw(2)
    } else if (choice[0] === 'coins') {
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(2)
    } else if (choice[0] === 'trash') {
      if (_.size(player_cards.hand) > 2) {
        let turn_event_id = TurnEventModel.insert({
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
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to trash but has no cards in hand`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
      card_trasher.trash()
    }
  }

}
