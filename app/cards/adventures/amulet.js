Amulet = class Amulet extends Card {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards) {
    player_cards.duration_effects.push(this.to_h())
    this.choose_one(game, player_cards)
    return 'duration'
  }

  duration(game, player_cards, duration_card) {
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> resolves ${CardView.render(duration_card)}`)
    this.choose_one(game, player_cards)
  }

  choose_one(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose One:`,
      minimum: 1,
      maximum: 1,
      options: [
        {text: '+$1', value: 'coin'},
        {text: 'Trash a card', value: 'trash'},
        {text: 'Gain a Silver', value: 'silver'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Amulet.process_choice)
  }

  static process_choice(game, player_cards, choice) {
    choice = choice[0]
    if (choice === 'coin') {
      let gained_coins = CoinGainer.gain(game, player_cards, 1)
      game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets +$${gained_coins}`)
    } else if (choice === 'trash') {
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
        turn_event_processor.process(Amulet.trash_card)
      } else {
        Amulet.trash_card(game, player_cards, player_cards.hand)
      }
    } else if (choice === 'silver') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain_game_card()
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    if (_.size(selected_cards) === 0) {
      game.log.push(`&nbsp;&nbsp;but has no cards in hand`)
    } else {
      let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards[0].name)
      card_trasher.trash()
    }
  }

}
