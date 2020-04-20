Amulet = class Amulet extends Duration {

  types() {
    return ['action', 'duration']
  }

  coin_cost() {
    return 3
  }

  play(game, player_cards, card_player) {
    this.choose_one(game, player_cards)
    player_cards.duration_effects.push(_.clone(card_player.card))
    return 'duration'
  }

  duration(game, player_cards, amulet) {
    game.log.push(`<strong>${player_cards.username}</strong> resolves ${CardView.render(amulet)}`)
    GameModel.update(game._id, game)
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
      let coin_gainer = new CoinGainer(game, player_cards)
      coin_gainer.gain(1)
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
      } else if (_.size() === 1) {
        Amulet.trash_card(game, player_cards, player_cards.hand)
      } else {
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> chooses to trash but has no cards in hand`)
      }
    } else if (choice === 'silver') {
      let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
      card_gainer.gain()
    }
  }

  static trash_card(game, player_cards, selected_cards) {
    let card_trasher = new CardTrasher(game, player_cards, 'hand', selected_cards)
    card_trasher.trash()
  }

}
