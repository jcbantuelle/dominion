RoyalCarriage = class RoyalCarriage extends Reserve {

  types() {
    return ['action', 'reserve']
  }

  coin_cost() {
    return 5
  }

  play(game, player_cards, card_player) {
    let action_gainer = new ActionGainer(game, player_cards)
    action_gainer.gain(1)

    Reserve.move_to_tavern(game, player_cards, card_player.card)
  }

  action_resolution_event(game, player_cards, royal_carriage, resolved_action) {
    let turn_event_id = TurnEventModel.insert({
      game_id: game._id,
      player_id: player_cards.player_id,
      username: player_cards.username,
      type: 'choose_yes_no',
      instructions: `Call ${CardView.render(royal_carriage)} to replay ${CardView.render(resolved_action)}?`,
      minimum: 1,
      maximum: 1
    })
    let turn_event_processor = new TurnEventProcessor(game, player_cards, turn_event_id, {resolved_action: resolved_action, royal_carriage: royal_carriage})
    turn_event_processor.process(RoyalCarriage.repeat_action)
  }

  static repeat_action(game, player_cards, response, params) {
    if (response === 'yes') {
      Reserve.call_from_tavern(game, player_cards, params.royal_carriage)

      let card_player = new CardPlayer(game, player_cards, params.resolved_action, params.royal_carriage)
      card_player.play(true)
    }
  }

}
