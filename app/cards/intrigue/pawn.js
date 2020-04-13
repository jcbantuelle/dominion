Pawn = class Pawn extends Card {

  types() {
    return ['action']
  }

  coin_cost() {
    return 2
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
        {text: '+1 card', value: 'card'},
        {text: '+1 action', value: 'action'},
        {text: '+1 buy', value: 'buy'},
        {text: '+$1', value: 'coin'}
      ]
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id)
    turn_event_processor.process(Pawn.process_choices)
  }

  static process_choices(game, player_cards, choices) {
    _.each(choices, (choice) => {
      if (choice === 'card') {
        let card_drawer = new CardDrawer(game, player_cards)
        card_drawer.draw(1)
      } else if (choice === 'action') {
        let action_gainer = new ActionGainer(game, player_cards)
        action_gainer.gain(1)
      } else if (choice === 'buy') {
        let buy_gainer = new BuyGainer(game, player_cards)
        buy_gainer.gain(1)
      } else if (choice === 'coin') {
        let coin_gainer = new CoinGainer(game, player_cards)
        coin_gainer.gain(1)
      }
    })
  }

}