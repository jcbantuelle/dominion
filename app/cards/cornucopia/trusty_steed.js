TrustySteed = class TrustySteed extends Card {

  types() {
    return this.capitalism_types(['action', 'prize'])
  }

  capitalism() {
    return true
  }

  coin_cost() {
    return 0
  }

  play(game, player_cards) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_options',
      instructions: `Choose Two:`,
      minimum: 2,
      maximum: 2,
      options: [
        {text: '+2 cards', value: 'card'},
        {text: '+2 actions', value: 'action'},
        {text: '+$2', value: 'coin'},
        {text: 'Gain 4 Silvers', value: 'silver'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(TrustySteed.process_choices)
  }

  static process_choices(game, player_cards, choices) {
    _.each(choices, (choice) => {
      if (choice === 'card') {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(2)
      } else if (choice === 'action') {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(2)
      } else if (choice === 'coin') {
        let coin_gainer = new CoinGainer(game, player_cards)
        coin_gainer.gain(2)
      } else if (choice === 'silver') {
        _.times(4, function() {
          let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
          card_gainer.gain()
        })
        let card_mover = new CardMover(game, player_cards)
        card_mover.move_all(player_cards.deck, player_cards.discard)
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
      }
    })
  }

}
