TrustySteed = class TrustySteed extends Card {

  types() {
    return ['action', 'prize']
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
    let gained = []
    _.each(choices, function(choice) {
      if (choice === 'card') {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(2)
      } else if (choice === 'action') {
        game.turn.actions += 2
        gained.push('+2 actions')
      } else if (choice === 'coin') {
        let gained_coins = CoinGainer.gain(game, player_cards, 2)
        gained.push(`+$${gained_coins}`)
      } else if (choice === 'silver') {
        _.times(4, function() {
          let card_gainer = new CardGainer(game, player_cards, 'discard', 'Silver')
          card_gainer.gain()
        })
        game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> puts their deck into their discard pile`)
        player_cards.discard = player_cards.discard.concat(player_cards.deck)
        player_cards.deck = []
      }
    })
    game.log.push(`&nbsp;&nbsp;<strong>${player_cards.username}</strong> gets ${gained.join(' and ')}`)
  }

}
