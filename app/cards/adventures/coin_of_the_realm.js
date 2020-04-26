CoinOfTheRealm = class CoinOfTheRealm extends Reserve {

  types() {
    return ['treasure', 'reserve']
  }

  coin_cost() {
    return 2
  }

  play(game, player_cards, card_player) {
    let coin_gainer = new CoinGainer(game, player_cards)
    coin_gainer.gain(1, false)
    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  action_resolution_event(game, player_cards, coin_of_the_realm) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(coin_of_the_realm)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, coin_of_the_realm)
    turn_event_processor.process(CoinOfTheRealm.call_coin)
  }

  static call_coin(game, player_cards, response, coin_of_the_realm) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, coin_of_the_realm)
      let action_gainer = new ActionGainer(game, player_cards)
      action_gainer.gain(2)
    }
  }

}
